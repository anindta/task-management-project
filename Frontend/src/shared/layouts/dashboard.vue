<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/shared/stores/auth.store'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const authStore = useAuthStore()
const route = useRoute()
const isCollapse = ref(false)

// Mapping Icon Remix berdasarkan nama menu DB
const iconMap: Record<string, string> = {
  'dashboard': 'ri-dashboard-line',
  'kanban': 'ri-kanban-view',
  'users': 'ri-user-settings-line',
  'roles': 'ri-shield-user-line',
  'menus': 'ri-menu-add-line'
}

const getRoutePath = (menuName: string) => {
  // 1. Cek Mapping Khusus (Kalau nama DB beda jauh sama URL)
  const specialMap: Record<string, string> = {
    'kanban': '/board',      // DB: kanban -> URL: /board
    'dashboard': '/dashboard' 
  }

  if (specialMap[menuName]) return specialMap[menuName]

  // 2. Default: Anggap nama menu di DB sama dengan URL
  // Contoh: DB 'projects' -> URL '/projects'
  // Contoh: DB 'reports'  -> URL '/reports'
  return `/${menuName}`
}
const activeMenu = computed(() => route.path)

const handleLogout = () => {
  ElMessageBox.confirm('Yakin ingin keluar sesi?', 'Logout', {
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
    type: 'warning',
  }).then(() => {
    authStore.logout()
  })
}

onMounted(() => {
  if (authStore.isAuthenticated && authStore.menus.length === 0) {
    authStore.fetchMyMenus()
  }
})
</script>

<template>
  <el-container class="h-screen">
    
    <el-aside width="260px" class="bg-white border-r border-gray-200 flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <i class="ri-checkbox-multiple-fill text-3xl text-primary mr-2"></i>
        <h1 class="text-xl font-bold text-gray-800">BeITs<span class="text-primary">Manager</span></h1>
      </div>

      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          class="border-none mt-2"
          :router="true"
          active-text-color="#f97316"
        >
          <el-menu-item 
            v-for="menu in authStore.menus" 
            :key="menu.id" 
            :index="getRoutePath(menu.name)"
          >
            <i :class="iconMap[menu.name] || 'ri-circle-line'" class="mr-2 text-lg"></i>
            <span>{{ menu.label }}</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>

      <div class="p-4 border-t border-gray-100">
        <el-button type="danger" plain class="w-full" @click="handleLogout">
          <i class="ri-logout-box-r-line mr-2"></i> Logout
        </el-button>
      </div>
    </el-aside>

    <el-container>
      <el-header class="bg-white border-b border-gray-200 flex items-center justify-between px-6 h-16">
        <div class="flex items-center text-gray-500">
          <i class="ri-menu-fold-line text-xl cursor-pointer hover:text-primary"></i>
          <span class="ml-4 font-medium">{{ route.meta.title || 'Dashboard' }}</span>
        </div>

        <div class="flex items-center gap-4">
           <el-tag type="warning" effect="light" round>
             {{ authStore.userRole }}
           </el-tag>
           <div class="flex items-center gap-2">
             <el-avatar :size="36" class="bg-orange-100 text-primary font-bold">
               {{ authStore.user?.username.charAt(0).toUpperCase() }}
             </el-avatar>
             <span class="text-sm font-semibold text-gray-700 hidden md:block">
               {{ authStore.user?.username }}
             </span>
           </div>
        </div>
      </el-header>

      <el-main class="bg-slate-50 p-6">
        <slot />
      </el-main>
    </el-container>

  </el-container>
</template>

<style scoped>
/* Custom style untuk active menu agar ada border orange di kiri */
.el-menu-item.is-active {
  background-color: #fff7ed; /* orange-50 */
  border-right: 3px solid #f97316;
}
.text-primary { color: #f97316; }
</style>