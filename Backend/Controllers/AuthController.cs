using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;
using TaskManagerAPI.DTOs;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace TaskManagerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(RegisterDto request)
        {
            if (_context.Users.Any(u => u.Username == request.Username))
            {
                return BadRequest("Username sudah terdaftar.");
            }

            // --- PERBAIKAN 1: Cari Role ID berdasarkan string ---
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);
            if (role == null) 
            {
                // Kalau role gak ketemu, kita defaultkan ke Employee (Id=3 sesuai seeding)
                // Atau return BadRequest("Role tidak valid");
                role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Employee");
            }
            // ----------------------------------------------------

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                Password = passwordHash,
                // Masukkan ID-nya, bukan String-nya
                RoleId = role!.Id 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registrasi berhasil!" });
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginDto request)
        {
            var user = await _context.Users
                .Include(u => u.Role) // <--- PERBAIKAN 2: Wajib Include Role biar namanya kebaca
                .FirstOrDefaultAsync(u => u.Username == request.Username);
            
            if (user == null) return BadRequest("User tidak ditemukan.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return BadRequest("Password salah.");
            }

            string token = CreateToken(user);

            // Return Role Name supaya frontend tau
            return Ok(new { token = token, role = user.Role?.Name, userId = user.Id });
        }
        
        // GET: api/Auth/my-menus (Menu akses user)
        [HttpGet("my-menus")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<ActionResult> GetMyMenus()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            
            var user = await _context.Users
                .Include(u => u.Role)
                .ThenInclude(r => r.RoleMenus)
                .ThenInclude(rm => rm.Menu)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return Unauthorized();

            if (user.Role == null) return Ok(new List<string>());

            var menus = user.Role.RoleMenus.Select(rm => new {
                rm.Menu.Id,
                rm.Menu.Name,  
                rm.Menu.Label  
            }).ToList();

            return Ok(menus);
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                // --- PERBAIKAN 3: Ambil Name dari object Role ---
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "Employee") 
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("JwtSettings:Key").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }
    }
}