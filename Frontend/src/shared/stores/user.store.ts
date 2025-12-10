import { defineStore } from 'pinia'
import apiClient from '@/shared/api/axios'
import type { User, CreateUserPayload } from '@/shared/types/user.types'
import { ElMessage } from 'element-plus'

interface UserState {
  users: User[];
  rolesList: any[]; // Untuk dropdown role
  loading: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    rolesList: [],
    loading: false
  }),

  actions: {
    // 1. Ambil Semua User
    async fetchUsers() {
      this.loading = true
      try {
        const { data } = await apiClient.get<User[]>('/Users')
        this.users = data
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    // 2. Ambil List Role (Untuk Pilihan di Form)
    async fetchRoles() {
      try {
        const { data } = await apiClient.get('/Roles')
        this.rolesList = data // Simpan list role
      } catch (error) {
        console.error(error)
      }
    },

    // 3. Tambah User
    async createUser(payload: CreateUserPayload) {
      try {
        await apiClient.post('/Users', payload)
        ElMessage.success('User berhasil dibuat')
        await this.fetchUsers() // Refresh tabel
        return true
      } catch (error: any) {
        ElMessage.error(error.response?.data || 'Gagal membuat user')
        return false
      }
    },

    // 4. Update User
    async updateUser(id: number, payload: CreateUserPayload) {
      try {
        await apiClient.put(`/Users/${id}`, payload)
        ElMessage.success('User berhasil diupdate')
        await this.fetchUsers()
        return true
      } catch (error: any) {
        ElMessage.error('Gagal update user')
        return false
      }
    },

    // 5. Hapus User
    async deleteUser(id: number) {
      try {
        await apiClient.delete(`/Users/${id}`)
        ElMessage.success('User dihapus')
        this.users = this.users.filter(u => u.id !== id) // Hapus dari state lokal
      } catch (error) {
        ElMessage.error('Gagal menghapus user')
      }
    }
  }
})