import { defineStore } from 'pinia'
import apiClient from '@/shared/api/axios'
import type { Task } from '@/shared/types/task.types'
import { ElMessage } from 'element-plus'

interface TaskState {
  tasks: Task[];
  loading: boolean;
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    loading: false
  }),

  actions: {
    // 1. Ambil Semua Tugas
    // Ubah parameternya jadi optional (pakai tanda tanya ?)
    async fetchTasks(projectId?: number) { 
      this.loading = true
      this.tasks = [] 
      
      try {
        const params: any = {}
        if (projectId) params.projectId = projectId

        const { data } = await apiClient.get<Task[]>('/Tasks', { params })
        this.tasks = data
      } catch (error) {
        console.error("Gagal ambil task:", error)
        ElMessage.error('Gagal memuat data tugas')
      } finally {
        this.loading = false
      }
    },

    // 2. Buat Tugas Baru
    async createTask(payload: Partial<Task>) {
      try {
        const { data } = await apiClient.post<Task>('/Tasks', payload)
        this.tasks.push(data) // Update UI langsung
        ElMessage.success('Tugas berhasil dibuat')
        return true
      } catch (error) {
        ElMessage.error('Gagal membuat tugas. Cek izin akses Anda.')
        return false
      }
    },

    // 3. Update Status (Drag & Drop)
   async updateTaskStatus(taskId: number, newStatus: number) {
      // Cari task di state lokal
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return

      const oldStatus = task.status
      
      // Optimistic Update (Ubah di layar duluan)
      task.status = newStatus

      try {
        // Kirim angka langsung sebagai Body
        await apiClient.put(`/Tasks/${taskId}/status`, newStatus, {
          headers: { 'Content-Type': 'application/json' }
        })
        console.log("Sukses update status di database")
      } catch (error) {
        console.error("Gagal update status:", error)
        task.status = oldStatus // Revert kalau gagal
        ElMessage.error('Gagal mengubah status.')
      }
    },
    async updateTaskContent(id: number, payload: Partial<Task>) {
      try {
        await apiClient.put(`/Tasks/${id}`, payload)
        ElMessage.success('Detail tugas diperbarui')
        // Update state lokal biar gak perlu fetch ulang
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          // Merge data baru ke data lama
          this.tasks[index] = { ...this.tasks[index], ...payload }
        }
        return true
      } catch (error) {
        ElMessage.error('Gagal update tugas')
        return false
      }
    },

    // 5. Hapus Tugas
    async deleteTask(id: number) {
      try {
        await apiClient.delete(`/Tasks/${id}`)
        ElMessage.success('Tugas dihapus')
        this.tasks = this.tasks.filter(t => t.id !== id)
        return true
      } catch (error) {
        ElMessage.error('Gagal menghapus tugas')
        return false
      }
    },
    // Action khusus saat geser ke Done
    async completeTask(id: number, note: string) {
      try {
        // Kirim note sebagai string (backend terima [FromBody] string)
        await apiClient.put(`/Tasks/${id}/complete`, JSON.stringify(note), {
          headers: { 'Content-Type': 'application/json' }
        })
        ElMessage.success('Tugas diselesaikan!')
        return true
      } catch (error) {
        ElMessage.error('Gagal menyelesaikan tugas')
        return false
      }
    },
  }
})