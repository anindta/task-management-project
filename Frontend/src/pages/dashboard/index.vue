<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/shared/stores/auth.store'
import { useDashboardStore } from '@/shared/stores/dashboard.store'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <el-card class="bg-gradient-to-r from-orange-500 to-orange-400 border-none text-white rounded-xl" shadow="hover">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <i class="ri-sun-line"></i> Halo, {{ authStore.user?.username }}!
          </h2>
          <p class="opacity-90 mt-1">Ini ringkasan aktivitas kerja Anda hari ini.</p>
        </div>
        <i class="ri-bar-chart-grouped-line text-6xl opacity-20 rotate-12"></i>
      </div>
    </el-card>

    <div v-if="dashboardStore.loading" class="py-10 text-center text-gray-400">
        <i class="ri-loader-4-line animate-spin text-2xl"></i> Memuat data...
    </div>

    <div v-else-if="dashboardStore.stats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      <el-card shadow="hover" class="rounded-xl border-none">
        <el-statistic :value="dashboardStore.stats.totalProjects" title="Total Proyek">
           <template #prefix>
              <i class="ri-folder-3-fill text-blue-500 mr-2 text-2xl"></i>
           </template>
        </el-statistic>
      </el-card>

      <el-card shadow="hover" class="rounded-xl border-none border-t-4 border-t-gray-400">
        <el-statistic :value="dashboardStore.stats.myTodo" title="Tugas Saya (To Do)">
          <template #prefix>
              <i class="ri-file-list-2-line text-gray-500 mr-2 text-2xl"></i>
           </template>
        </el-statistic>
      </el-card>

      <el-card shadow="hover" class="rounded-xl border-none border-t-4 border-t-orange-400">
        <el-statistic :value="dashboardStore.stats.myProgress" title="Sedang Dikerjakan">
          <template #prefix>
              <i class="ri-loader-2-line text-orange-500 mr-2 text-2xl animate-spin"></i>
           </template>
        </el-statistic>
      </el-card>

      <el-card shadow="hover" class="rounded-xl border-none border-t-4 border-t-green-400">
        <el-statistic :value="dashboardStore.stats.myDone" title="Selesai">
          <template #prefix>
              <i class="ri-checkbox-circle-fill text-green-500 mr-2 text-2xl"></i>
           </template>
        </el-statistic>
      </el-card>

    </div>

    <div class="mt-8">
        <h3 class="font-bold text-gray-700 mb-4">Akses Cepat</h3>
        <div class="flex gap-4">
            <el-button type="primary" size="large" plain @click="$router.push('/board')">
                <i class="ri-kanban-view mr-2"></i> Buka Kanban Board
            </el-button>
            <el-button v-if="authStore.userRole === 'Admin'" type="warning" size="large" plain @click="$router.push('/users')">
                <i class="ri-user-add-line mr-2"></i> Tambah User Baru
            </el-button>
        </div>
    </div>
  </div>
</template>