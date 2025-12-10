import { defineStore } from 'pinia'
import apiClient from '@/shared/api/axios'
import type { Project } from '@/shared/types/project.types'
import { ElMessage } from 'element-plus'

interface ProjectState {
  projects: Project[];
  loading: boolean;
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    loading: false
  }),

  actions: {
    // 1. Ambil Semua Project
    async fetchProjects() {
      this.loading = true
      try {
        const { data } = await apiClient.get<Project[]>('/Projects')
        this.projects = data
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    // 2. Create Project
    async createProject(payload: { name: string; description: string }) {
      try {
        await apiClient.post('/Projects', payload)
        ElMessage.success('Proyek berhasil dibuat')
        await this.fetchProjects()
        return true
      } catch (error) {
        ElMessage.error('Gagal membuat proyek')
        return false
      }
    },

    // 3. Delete Project
    async deleteProject(id: number) {
      try {
        await apiClient.delete(`/Projects/${id}`)
        ElMessage.success('Proyek dihapus')
        this.projects = this.projects.filter(p => p.id !== id)
      } catch (error) {
        ElMessage.error('Gagal menghapus proyek')
      }
    },

    // 4. Ambil 1 Project dari State Lokal (INI YANG TADI MISSING)
    getProjectById(id: number) {
      return this.projects.find(p => p.id === id)
    }
  }
})