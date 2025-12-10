import { defineStore } from 'pinia'
import apiClient from '@/shared/api/axios'
import type { Role, RolePayload, MenuOption } from '@/shared/types/role.types'
import { ElMessage } from 'element-plus'

interface RoleState {
  roles: Role[];
  availableMenus: MenuOption[]; // Pilihan menu buat checkbox
  loading: boolean;
}

export const useRoleStore = defineStore('role', {
  state: (): RoleState => ({
    roles: [],
    availableMenus: [],
    loading: false
  }),

  actions: {
    // 1. Ambil Semua Role
    async fetchRoles() {
      this.loading = true
      try {
        const { data } = await apiClient.get<Role[]>('/Roles')
        this.roles = data
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    // 2. Ambil Menu yang Tersedia (Untuk opsi Checkbox)
    async fetchAvailableMenus() {
      try {
        const { data } = await apiClient.get<MenuOption[]>('/Roles/menus')
        this.availableMenus = data
      } catch (error) {
        console.error(error)
      }
    },

    // 3. Tambah Role
    async createRole(payload: RolePayload) {
      try {
        await apiClient.post('/Roles', payload)
        ElMessage.success('Role berhasil dibuat')
        await this.fetchRoles()
        return true
      } catch (error: any) {
        ElMessage.error(error.response?.data || 'Gagal membuat role')
        return false
      }
    },

    // 4. Update Role & Permission
    async updateRole(id: number, payload: RolePayload) {
      try {
        await apiClient.put(`/Roles/${id}`, payload)
        ElMessage.success('Role & Permission diupdate')
        await this.fetchRoles()
        return true
      } catch (error: any) {
        ElMessage.error('Gagal update role')
        return false
      }
    },

    // 5. Hapus Role
    async deleteRole(id: number) {
      try {
        await apiClient.delete(`/Roles/${id}`)
        ElMessage.success('Role dihapus')
        this.roles = this.roles.filter(r => r.id !== id)
      } catch (error: any) {
        // Backend akan return 400 kalau role sedang dipakai user
        ElMessage.error(error.response?.data || 'Gagal menghapus role')
      }
    }
  }
})