import { defineStore } from 'pinia'
import apiClient from '@/shared/api/axios'
import router from '@/shared/routers/index.route'
import type { AuthState, AuthResponse, Menu, User } from '@/shared/types/auth.types'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    user: localStorage.getItem('user') 
      ? JSON.parse(localStorage.getItem('user') as string) 
      : null,
    menus: [],
    loading: false
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    userRole: (state): string => state.user?.role || 'Guest'
  },

  actions: {
    async login(username: string, password: string) {
      this.loading = true
      try {
        // 1. Login ke API
        const { data } = await apiClient.post<AuthResponse>('/Auth/login', { username, password })
        
        // 2. Simpan Token
        this.token = data.token
        
        // 3. Bentuk object User
        const userData: User = { 
            id: data.userId, 
            role: data.role, 
            username: username 
        }
        this.user = userData

        // 4. Simpan ke LocalStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(userData))

        // 5. Ambil Menu Permission
        await this.fetchMyMenus()

        // 6. Redirect ke Dashboard
        router.push('/dashboard')
        
        return true
      } catch (error) {
        console.error("Login gagal:", error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMyMenus() {
      try {
        const { data } = await apiClient.get<Menu[]>('/Auth/my-menus')
        this.menus = data
      } catch (error) {
        console.error("Gagal load menu", error)
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.menus = []
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      router.push('/login')
    }
  }
})