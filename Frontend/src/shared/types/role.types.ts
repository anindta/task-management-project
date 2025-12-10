// Menu yang tersedia untuk dipilih
export interface MenuOption {
  id: number;
  name: string;
  label: string;
}

// Data Role yang diterima dari Backend (GET)
export interface Role {
  id: number;
  name: string;
  menuLabels: string[]; // List nama menu untuk ditampilkan di tabel
  menuIds: number[];    // List ID menu untuk mengisi checkbox saat edit
}

// Data yang dikirim ke Backend (POST/PUT)
export interface RolePayload {
  name: string;
  menuIds: number[];
}