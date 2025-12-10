import { createRouter, createWebHistory } from 'vue-router'
import { type IStaticMethods } from 'preline/preline'
// Import Layouts
import dashboardLayout from '@/shared/layouts/dashboard.vue'
import blankLayout from '@/shared/layouts/blank.vue'
import path from 'path'

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

const ROUTES = [
  // Halaman Login
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/auth/login.vue'),
    meta: {
      title: 'Login',
      layout: blankLayout, // Pakai layout kosong
      requiresAuth: false
    },
  },
  // Halaman Dashboard Utama
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/index.vue'),
    meta: {
      title: 'Dashboard',
      layout: dashboardLayout, // Pakai layout dashboard
      requiresAuth: true
    },
  },
  // Halaman Kanban
  {
    path: '/board',
    name: 'kanban',
    component: () => import('@/pages/dashboard/kanban.vue'),
    meta: {
      title: 'Kanban Board',
      layout: dashboardLayout,
      requiresAuth: true
    },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/pages/dashboard/users.vue'),
    meta: {
      title: 'Manajemen User',
      layout: dashboardLayout,
      requiresAuth: true
    },
  },
  {
  path: '/roles',
  name: 'roles',
  component: () => import('@/pages/dashboard/roles.vue'),
  meta: {
    title: 'Manajemen Role',
    layout: dashboardLayout,
    requiresAuth: true
  },
},
{
  path: '/menus',
  name: 'menus',
  component: () => import('@/pages/dashboard/menus.vue'),
  meta: {
    title: 'System Menus',
    layout: dashboardLayout,
    requiresAuth: true
  },
},
{
  path: '/projects',
  name: 'projects',
  component: () => import('@/pages/dashboard/projects.vue'),
  meta: {
    title: 'Manajemen Proyek',
    layout: dashboardLayout,
    requiresAuth: true
  },
},
// ...
{
  // Route Dinamis: :id akan berubah sesuai project yang diklik
  path: '/projects/:id', 
  name: 'project-detail',
  component: () => import('@/pages/dashboard/project-detail.vue'),
  meta: {
    title: 'Detail Proyek',
    layout: dashboardLayout,
    requiresAuth: true
  },
},
// ...
{
  path: '/tasks',
  name: 'tasks',
  component: () => import('@/pages/dashboard/tasks.vue'),
  meta: {
    title: 'Daftar Tugas',
    layout: dashboardLayout,
    requiresAuth: true
  },
},
  // Default Redirect
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  routes: ROUTES,
  history: createWebHistory(),
})

router.afterEach((_to, _from, failure) => {
  if (!failure) {
    setTimeout(() => {
      window.HSStaticMethods.autoInit()
    }, 100)
  }
})

export default router
