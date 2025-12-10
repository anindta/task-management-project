import { defineStore } from 'pinia'
import apiClient from '@/shared/api/axios'
import type { Menu, MenuPayload } from '@/shared/types/menu.types'
import { ElMessage } from 'element-plus'

interface MenuState {
  menus: Menu[];
  loading: boolean;
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    menus: [],
    loading: false
  }),

  actions: {
    async fetchMenus() {
      this.loading = true
      try {
        // Endpoint ini tadi sudah dibuat di MenusController backend
        const { data } = await apiClient.get<Menu[]>('/Menus')
        this.menus = data
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async createMenu(payload: MenuPayload) {
      try {
        await apiClient.post('/Menus', payload)
        ElMessage.success('Menu sistem berhasil didaftarkan')
        await this.fetchMenus()
        return true
      } catch (error: any) {
        ElMessage.error(error.response?.data || 'Gagal create menu')
        return false
      }
    },

    async updateMenu(id: number, payload: MenuPayload) {
      try {
        await apiClient.put(`/Menus/${id}`, payload)
        ElMessage.success('Menu update sukses')
        await this.fetchMenus()
        return true
      } catch (error: any) {
        ElMessage.error('Gagal update')
        return false
      }
    },

    async deleteMenu(id: number) {
      try {
        await apiClient.delete(`/Menus/${id}`)
        ElMessage.success('Menu dihapus')
        this.menus = this.menus.filter(m => m.id !== id)
      } catch (error: any) {
        // Backend akan nolak kalau menu ini lagi dipake di Role
        ElMessage.error(error.response?.data || 'Gagal hapus menu')
      }
    }
  }
})