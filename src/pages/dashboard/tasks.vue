<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useTaskStore } from '@/shared/stores/task.store'
import { useProjectStore } from '@/shared/stores/project.store'
import { useUserStore } from '@/shared/stores/user.store' // Tambah UserStore
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Task } from '@/shared/types/task.types'

// Stores
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

// State Filter
const filterProjectId = ref<number | null>(null)

// State Modal Form
const dialogVisible = ref(false)
const isEdit = ref(false)
const formLoading = ref(false)

// Form Data
const form = reactive({
  id: 0,
  title: '',
  description: '',
  deadline: '',
  projectId: null as number | null, // Wajib pilih project
  assignedUserId: null as number | null,
  status: 0
})

onMounted(async () => {
  await projectStore.fetchProjects()
  await userStore.fetchUsers() // Ambil user buat dropdown assign
  await taskStore.fetchTasks() // Ambil semua tugas
})

// --- Logic Filter ---
const handleFilterChange = () => {
  if (filterProjectId.value) {
    taskStore.fetchTasks(filterProjectId.value)
  } else {
    taskStore.fetchTasks()
  }
}

// --- Logic Modal (Create/Edit) ---

// 1. Buka Modal CREATE
const openCreate = () => {
  isEdit.value = false
  form.title = ''
  form.description = ''
  form.deadline = new Date().toISOString()
  form.projectId = filterProjectId.value || null // Kalau lagi filter, otomatis pilih project itu
  form.assignedUserId = null
  form.status = 0
  dialogVisible.value = true
}

// 2. Buka Modal EDIT
const openEdit = (task: Task) => {
  isEdit.value = true
  form.id = task.id
  form.title = task.title
  form.description = task.description
  form.deadline = task.deadline
  form.projectId = task.projectId // Project ID dari data task
  form.assignedUserId = task.assignedUserId || null
  form.status = task.status
  dialogVisible.value = true
}

// 3. Submit Form
const handleSubmit = async () => {
  if (!form.title || !form.projectId) {
    ElMessage.warning('Judul dan Proyek wajib diisi')
    return
  }

  formLoading.value = true
  let success = false

  const payload = {
    title: form.title,
    description: form.description,
    deadline: form.deadline,
    projectId: form.projectId,
    status: form.status,
    // Handle null vs undefined untuk TypeScript
    assignedUserId: form.assignedUserId ? form.assignedUserId : undefined
  }

  if (isEdit.value) {
    // Update
    success = await taskStore.updateTaskContent(form.id, { ...payload, id: form.id })
    // Jika status berubah, kita panggil updateStatus terpisah (karena backend memisahkan logicnya)
    if (success) {
        await taskStore.updateTaskStatus(form.id, form.status)
    }
  } else {
    // Create
    success = await taskStore.createTask(payload)
  }

  formLoading.value = false
  if (success) {
    dialogVisible.value = false
    // Refresh data tabel
    handleFilterChange()
  }
}

// --- Logic Delete ---
const handleDelete = (task: Task) => {
  ElMessageBox.confirm(`Hapus tugas "${task.title}"?`, 'Warning', {
    confirmButtonText: 'Hapus',
    type: 'warning'
  }).then(async () => {
    await taskStore.deleteTask(task.id)
  })
}

// Helper Status Label
const getStatusTag = (status: number) => {
    if (status === 0) return { type: 'info', label: 'To Do' }
    if (status === 1) return { type: 'warning', label: 'On Progress' }
    return { type: 'success', label: 'Done' }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Daftar Semua Tugas</h1>
        <p class="text-gray-400 text-sm">Kelola tugas dari berbagai proyek dalam satu tabel.</p>
      </div>

      <div class="flex gap-3">
         <el-select 
            v-model="filterProjectId" 
            placeholder="Filter Proyek" 
            clearable 
            @change="handleFilterChange"
            class="w-48"
         >
            <el-option 
                v-for="p in projectStore.projects" 
                :key="p.id" 
                :label="p.name" 
                :value="p.id" 
            />
         </el-select>
         
         <el-button type="primary" @click="openCreate">
            <i class="ri-add-line mr-2"></i> Tambah Tugas
         </el-button>
      </div>
    </div>

    <el-card shadow="never" class="border-none rounded-xl">
      <el-table :data="taskStore.tasks" v-loading="taskStore.loading" stripe size="large">
        
        <el-table-column label="Judul Tugas" min-width="200">
           <template #default="scope">
              <div class="font-bold text-gray-700">{{ scope.row.title }}</div>
              <div class="text-xs text-gray-400 line-clamp-1">{{ scope.row.description }}</div>
           </template>
        </el-table-column>

        <el-table-column label="Proyek" width="180">
           <template #default="scope">
              <div class="flex items-center gap-2 text-gray-600">
                 <i class="ri-folder-3-line text-orange-500"></i>
                 <span>{{ scope.row.project?.name || '-' }}</span>
              </div>
           </template>
        </el-table-column>

        <el-table-column label="Assigned To" width="160">
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

        <el-table-column label="Status" width="120" align="center">
           <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status).type" effect="light" round>
                 {{ getStatusTag(scope.row.status).label }}
              </el-tag>
           </template>
        </el-table-column>

        <el-table-column label="Deadline" width="140">
           <template #default="scope">
              <span class="text-sm text-gray-600">
                 {{ new Date(scope.row.deadline).toLocaleDateString() }}
              </span>
           </template>
        </el-table-column>

        <el-table-column label="Aksi" width="140" align="center">
           <template #default="scope">
              <el-button-group>
                 <el-button type="primary" link @click="openEdit(scope.row)">
                    <i class="ri-edit-line text-lg"></i>
                 </el-button>
                 <el-button type="danger" link @click="handleDelete(scope.row)">
                    <i class="ri-delete-bin-line text-lg"></i>
                 </el-button>
              </el-button-group>
           </template>
        </el-table-column>

      </el-table>
    </el-card>

    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? 'Edit Detail Tugas' : 'Tambah Tugas Baru'"
        width="500px"
        destroy-on-close
    >
        <el-form label-position="top">
            
            <el-form-item label="Proyek">
                <el-select v-model="form.projectId" placeholder="Pilih Project" class="w-full">
                    <el-option 
                        v-for="p in projectStore.projects" 
                        :key="p.id" 
                        :label="p.name" 
                        :value="p.id" 
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="Judul Tugas">
                <el-input v-model="form.title" placeholder="Contoh: Fix Bug Login" />
            </el-form-item>
            
            <el-form-item label="Deskripsi">
                <el-input v-model="form.description" type="textarea" placeholder="Detail pekerjaan..." :rows="3" />
            </el-form-item>

            <div class="grid grid-cols-2 gap-4">
                <el-form-item label="Status">
                     <el-select v-model="form.status" placeholder="Status">
                        <el-option label="To Do" :value="0" />
                        <el-option label="On Progress" :value="1" />
                        <el-option label="Done" :value="2" />
                    </el-select>
                </el-form-item>

                <el-form-item label="Deadline">
                    <el-date-picker 
                        v-model="form.deadline" 
                        type="date" 
                        placeholder="Pilih Tanggal" 
                        style="width: 100%" 
                    />
                </el-form-item>
            </div>

            <el-form-item label="Ditugaskan Ke">
                <el-select v-model="form.assignedUserId" placeholder="Pilih User" class="w-full" clearable>
                    <el-option 
                        v-for="user in userStore.users" 
                        :key="user.id" 
                        :label="user.username + ' (' + user.role + ')'" 
                        :value="user.id" 
                    />
                </el-select>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="dialogVisible = false">Batal</el-button>
            <el-button type="primary" :loading="formLoading" @click="handleSubmit">
                Simpan
            </el-button>
        </template>
    </el-dialog>
  </div>
</template>