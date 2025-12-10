<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/shared/stores/auth.store'
import { ElNotification } from 'element-plus'

const authStore = useAuthStore()
const form = reactive({ username: '', password: '' })
const loading = ref(false)

const onLogin = async () => {
  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    ElNotification({
      title: 'Sukses',
      message: 'Selamat datang kembali!',
      type: 'success',
    })
  } catch (err) {
    ElNotification({
      title: 'Gagal',
      message: 'Username atau password salah.',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-50">
    <el-card class="w-full max-w-md rounded-xl shadow-lg border-none" body-style="padding: 40px;">
      
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <i class="ri-checkbox-multiple-fill text-3xl text-orange-500"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800">Login Area</h2>
        <p class="text-gray-400 text-sm mt-1">Masuk untuk mengelola tugas tim.</p>
      </div>

      <el-form @submit.prevent="onLogin" label-position="top" size="large">
        <el-form-item label="Username">
          <el-input 
            v-model="form.username" 
            placeholder="Masukkan username" 
            prefix-icon="ri-user-line"
          >
             <template #prefix>
                <i class="ri-user-3-line text-gray-400"></i>
             </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="••••••••" 
            show-password
          >
            <template #prefix>
                <i class="ri-lock-2-line text-gray-400"></i>
             </template>
          </el-input>
        </el-form-item>

        <el-button 
          type="primary" 
          class="w-full mt-4 font-bold" 
          :loading="loading" 
          @click="onLogin"
          size="large"
          round
        >
          Masuk Sekarang
        </el-button>
      </el-form>

      <div class="mt-6 text-center text-xs text-gray-400">
        &copy; 2025 BeITs Task Manager
      </div>
    </el-card>
  </div>
</template>