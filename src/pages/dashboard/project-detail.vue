<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/shared/stores/task.store'
import { useProjectStore } from '@/shared/stores/project.store'
import { useUserStore } from '@/shared/stores/user.store'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Task } from '@/shared/types/task.types'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

// Ambil ID dari URL
const projectId = Number(route.params.id)

// State
const project = ref<any>(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formLoading = ref(false)

// Form Data (Sama kayak Task List, tapi projectId di-lock)
const form = reactive({
  id: 0,
  title: '',
  description: '',
  deadline: '',
  assignedUserId: null as number | null,
  status: 0
})

onMounted(async () => {
  // 1. Pastikan data project ada
  if (projectStore.projects.length === 0) await projectStore.fetchProjects()
  
  // 2. Ambil detail project ini
  project.value = projectStore.getProjectById(projectId)
  
  // 3. Ambil Task khusus project ini
  await taskStore.fetchTasks(projectId)
  await userStore.fetchUsers()
})

// Hitung Progress Bar Project
const progressPercentage = computed(() => {
    if (taskStore.tasks.length === 0) return 0
    const done = taskStore.tasks.filter(t => t.status === 2).length
    return Math.round((done / taskStore.tasks.length) * 100)
})

// --- Logic CRUD (Sama kayak tasks.vue tapi lebih simpel) ---

const openCreate = () => {
  isEdit.value = false
  form.title = ''
  form.description = ''
  form.deadline = new Date().toISOString()
  form.assignedUserId = null
  form.status = 0
  dialogVisible.value = true
}

const openEdit = (task: Task) => {
  isEdit.value = true
  form.id = task.id
  form.title = task.title
  form.description = task.description
  form.deadline = task.deadline
  form.assignedUserId = task.assignedUserId || null
  form.status = task.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title) return
  formLoading.value = true
  
  const payload = {
      ...form,
      projectId: projectId, // Otomatis ID project ini
      assignedUserId: form.assignedUserId ? form.assignedUserId : undefined
  }

  let success = false
  if (isEdit.value) {
      success = await taskStore.updateTaskContent(form.id, payload)
      if(success) await taskStore.updateTaskStatus(form.id, form.status)
  } else {
      success = await taskStore.createTask(payload)
  }

  formLoading.value = false
  if (success) {
      dialogVisible.value = false
      taskStore.fetchTasks(projectId) // Refresh
  }
}

const handleDelete = (task: Task) => {
  ElMessageBox.confirm(`Hapus tugas "${task.title}"?`, 'Warning', { confirmButtonText: 'Hapus', type: 'warning' })
    .then(async () => {
       await taskStore.deleteTask(task.id)
    })
}

const getStatusTag = (status: number) => {
    if (status === 0) return { type: 'info', label: 'To Do' }
    if (status === 1) return { type: 'warning', label: 'On Progress' }
    return { type: 'success', label: 'Done' }
}
</script>

<template>
  <div v-if="project">
    <el-card shadow="never" class="border-none rounded-xl bg-white mb-6">
        <div class="flex justify-between items-start">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <el-button circle size="small" @click="router.push('/projects')">
                        <i class="ri-arrow-left-line"></i>
                    </el-button>
                    <h1 class="text-2xl font-bold text-gray-800">{{ project.name }}</h1>
                </div>
                <p class="text-gray-500 ml-10">{{ project.description }}</p>
            </div>
            
            <el-button type="primary" size="large" @click="openCreate">
                <i class="ri-add-line mr-2"></i> Buat Tugas
            </el-button>
        </div>

        <div class="mt-6 ml-10 flex items-center gap-4">
            <span class="text-sm font-bold text-gray-600">Progress Project:</span>
            <el-progress 
                :percentage="progressPercentage" 
                :status="progressPercentage === 100 ? 'success' : ''"
                class="w-64"
            />
        </div>
    </el-card>

    <el-card shadow="never" class="border-none rounded-xl">
        <el-table :data="taskStore.tasks" v-loading="taskStore.loading" stripe size="large">
            <el-table-column label="Judul Tugas" min-width="250">
                <template #default="scope">
                    <div class="font-bold text-gray-700">{{ scope.row.title }}</div>
                    <div class="text-xs text-gray-400">{{ scope.row.description }}</div>
                </template>
            </el-table-column>

            <el-table-column label="Assigned To" width="180">
                <template #default="scope">
                    <div v-if="scope.row.assignedUser" class="flex items-center gap-2">
                        <el-avatar :size="24" class="bg-blue-100 text-blue-600 text-xs">
                            {{ scope.row.assignedUser.username.charAt(0).toUpperCase() }}
                        </el-avatar>
                        <span class="text-sm">{{ scope.row.assignedUser.username }}</span>
                    </div>
                    <span v-else class="text-xs text-gray-400 italic">Unassigned</span>
                </template>
            </el-table-column>

            <el-table-column label="Status" width="150" align="center">
                <template #default="scope">
                    <el-tag :type="getStatusTag(scope.row.status).type" effect="light" round>
                        {{ getStatusTag(scope.row.status).label }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="Deadline" width="150">
                <template #default="scope">
                    {{ new Date(scope.row.deadline).toLocaleDateString() }}
                </template>
            </el-table-column>

            <el-table-column label="Aksi" width="150" align="center">
                <template #default="scope">
                    <el-button type="primary" link @click="openEdit(scope.row)">
                        <i class="ri-edit-line text-lg"></i>
                    </el-button>
                    <el-button type="danger" link @click="handleDelete(scope.row)">
                        <i class="ri-delete-bin-line text-lg"></i>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Tugas' : 'Tambah Tugas'" width="500px">
        <el-form label-position="top">
            <el-form-item label="Judul">
                <el-input v-model="form.title" />
            </el-form-item>
            <el-form-item label="Deskripsi">
                <el-input v-model="form.description" type="textarea" />
            </el-form-item>
            <div class="grid grid-cols-2 gap-4">
                 <el-form-item label="Status">
                     <el-select v-model="form.status">
                        <el-option label="To Do" :value="0" />
                        <el-option label="On Progress" :value="1" />
                        <el-option label="Done" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Deadline">
                    <el-date-picker v-model="form.deadline" type="date" style="width: 100%" />
                </el-form-item>
            </div>
            <el-form-item label="Assign User">
                <el-select v-model="form.assignedUserId" class="w-full" clearable>
                    <el-option v-for="u in userStore.users" :key="u.id" :label="u.username" :value="u.id" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="dialogVisible = false">Batal</el-button>
            <el-button type="primary" :loading="formLoading" @click="handleSubmit">Simpan</el-button>
        </template>
    </el-dialog>
  </div>
  <div v-else class="text-center py-10">
      <el-spinner class="text-3xl" />
  </div>
</template>