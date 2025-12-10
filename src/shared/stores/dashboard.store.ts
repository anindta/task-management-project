import { defineStore } from 'pinia'
import apiClient from '@/shared/api/axios'
import type { DashboardStats } from '@/shared/types/dashboard.types'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: null as DashboardStats | null,
    loading: false
  }),

  actions: {
    async fetchStats() {
      this.loading = true
      try {
        const { data } = await apiClient.get<DashboardStats>('/Dashboard/stats')
        this.stats = data
      } catch (error) {
        console.error("Gagal load stats", error)
      } finally {
        this.loading = false
      }
    }
  }
})