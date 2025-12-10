<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useTaskStore } from '@/shared/stores/task.store'
import { useProjectStore } from '@/shared/stores/project.store'
import { useUserStore } from '@/shared/stores/user.store'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Task } from '@/shared/types/task.types'
import { useRoute } from 'vue-router'

const route = useRoute() 
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const selectedProjectId = ref<number | null>(null)

// Ref lokal untuk Draggable
const todoList = ref<Task[]>([])
const progressList = ref<Task[]>([])
const doneList = ref<Task[]>([])

// State Modal (Biarkan sama seperti sebelumnya)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formLoading = ref(false)
const form = reactive({ id: 0, title: '', description: '', deadline: '', assignedUserId: null as number | null, status: 0 })

onMounted(async () => {
  await userStore.fetchUsers()
  await projectStore.fetchProjects()
  
  // LOGIC PILIH PROJECT OTOMATIS (YANG DIPERBAIKI)
  if (projectStore.projects.length > 0) {
    
    // Cek apakah ada projectId di URL?
    const queryId = Number(route.query.projectId)
    
    // Validasi: Apakah ID dari URL itu valid (ada di list project kita)?
    const isIdValid = projectStore.projects.some(p => p.id === queryId)

    if (queryId && isIdValid) {
        // Jika ada di URL, pakai itu
        selectedProjectId.value = queryId
    } else {
        // Jika tidak ada di URL, default ke project pertama
        selectedProjectId.value = projectStore.projects[0].id
    }
    
    // Load tasks
    loadTasks()
  }
})

const loadTasks = async () => {
  if (selectedProjectId.value) {
    console.log("Ganti Project ke ID:", selectedProjectId.value)
    await taskStore.fetchTasks(selectedProjectId.value)
  }
}

// 2. Watcher untuk Dropdown (Biar otomatis load kalau nilai berubah)
watch(selectedProjectId, () => {
    loadTasks()
})

// UPDATE LIST SAAT DATA STORE BERUBAH
watch(() => taskStore.tasks, (newTasks) => {
    console.log("Data Task Berubah:", newTasks.length)
    
    // Reset list lokal dulu
    todoList.value = []
    progressList.value = []
    doneList.value = []

    // Isi ulang (Gunakan nextTick kalau perlu, tapi biasanya ini cukup)
    todoList.value = newTasks.filter(t => t.status === 0)
    progressList.value = newTasks.filter(t => t.status === 1)
    doneList.value = newTasks.filter(t => t.status === 2)
}, { deep: true })

// Fungsi Drag & Drop
// Fungsi Drag & Drop
// Fungsi Drag & Drop
// Ganti nama function jadi onAdd
const onAdd = (event: any, newStatus: number) => {
    // 1. Tentukan list mana yang jadi tujuan
    let targetList: Task[] = []
    if (newStatus === 0) targetList = todoList.value
    else if (newStatus === 1) targetList = progressList.value
    else if (newStatus === 2) targetList = doneList.value
    
    // 2. Ambil task berdasarkan index barunya di list tujuan
    // event.newIndex adalah posisi item setelah dijatuhkan
    if (event.newIndex !== undefined && targetList[event.newIndex]) {
        const task = targetList[event.newIndex]
        
        console.log(`✅ Pindah Task "${task.title}" ke Status: ${newStatus}`)
        
        // 3. Panggil API & Update Lokal
        taskStore.updateTaskStatus(task.id, newStatus)
        task.status = newStatus
    }
}
// --- CRUD MODAL LOGIC ---

// 1. Buka Modal CREATE
const openCreateModal = () => {
    if (!selectedProjectId.value) {
        ElMessage.warning('Pilih proyek terlebih dahulu')
        return
    }
    isEdit.value = false
    form.title = ''
    form.description = ''
    form.deadline = new Date().toISOString() // Default hari ini
    form.assignedUserId = null
    form.status = 0 // Default To Do
    dialogVisible.value = true
}

// 2. Buka Modal EDIT (Saat kartu diklik)
const openEditModal = (task: Task) => {
    isEdit.value = true
    form.id = task.id
    form.title = task.title
    form.description = task.description
    form.deadline = task.deadline
    form.assignedUserId = task.assignedUserId || null
    form.status = task.status
    dialogVisible.value = true
}

// 3. Submit Form
const handleSubmit = async () => {
    if (!form.title) {
        ElMessage.warning('Judul tugas wajib diisi')
        return
    }

    formLoading.value = true
    let success = false
    
    // Payload data yang dikirim ke API
    const payload = {
        title: form.title,
        description: form.description,
        deadline: form.deadline,
        assignedUserId: form.assignedUserId,
        projectId: selectedProjectId.value!,
        status: form.status // Tetap kirim status
    }

    if (isEdit.value) {
        // Mode Edit: Kirim ID juga untuk update content
        success = await taskStore.updateTaskContent(form.id, { ...payload, id: form.id })
    } else {
        // Mode Create
        success = await taskStore.createTask(payload)
    }

    formLoading.value = false
    if (success) {
        dialogVisible.value = false
        // Refresh manual supaya tampilan user yang diassign langsung berubah
        loadTasks() 
    }
}

// 4. Delete Task
const handleDelete = () => {
    ElMessageBox.confirm('Hapus tugas ini secara permanen?', 'Warning', {
        confirmButtonText: 'Hapus',
        type: 'warning'
    }).then(async () => {
        const success = await taskStore.deleteTask(form.id)
        if (success) dialogVisible.value = false
    })
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-6">
        <div>
           <h1 class="text-2xl font-bold text-gray-800">Kanban Board</h1>
           <p class="text-gray-400 text-sm" v-if="selectedProjectId">
             Project ID: {{ selectedProjectId }} | Total Tugas: {{ taskStore.tasks.length }}
           </p>
        </div>

        <div class="flex gap-3">
            <el-select 
                v-model="selectedProjectId" 
                placeholder="Pilih Proyek" 
                size="large" 
                class="w-64"
                @change="loadTasks"
            >
                <template #prefix><i class="ri-folder-3-line text-orange-500"></i></template>
                <el-option 
                    v-for="proj in projectStore.projects" 
                    :key="proj.id" 
                    :label="proj.name" 
                    :value="proj.id" 
                />
            </el-select>

            <el-button type="primary" size="large" circle @click="openCreateModal">
               <i class="ri-add-line text-xl"></i>
            </el-button>
        </div>
    </div>

    <div class="flex gap-6 overflow-x-auto pb-4 h-full">
        
        <div class="flex-1 min-w-[300px] bg-slate-100 rounded-xl p-3 flex flex-col">
            <div class="flex justify-between items-center mb-3 px-1">
                <span class="font-bold text-gray-600 flex items-center gap-2">To Do</span>
                <el-tag type="info" round>{{ todoList.length }}</el-tag>
            </div>
            
            <VueDraggable 
                v-model="todoList"
                group="tasks" 
                @add="onAdd($event, 0)"
                class="flex-1 space-y-3 min-h-[100px]"
                ghost-class="ghost"
                :animation="150"
            >
                <div v-for="element in todoList" :key="element.id">
                    <el-card shadow="hover" class="cursor-pointer border-l-4 border-l-gray-400 rounded-lg mb-3" @click="openEditModal(element)">
                        <h4 class="font-bold text-gray-800 mb-1">{{ element.title }}</h4>
                        <p class="text-xs text-gray-500 line-clamp-2">{{ element.description }}</p>
                        
                        <div class="flex justify-between items-center mt-3">
                           <el-tag size="small" type="info">{{ new Date(element.deadline).toLocaleDateString() }}</el-tag>
                           <el-avatar v-if="element.assignedUser" :size="24" class="bg-gray-200 text-gray-600 text-xs">
                              {{ element.assignedUser.username.charAt(0).toUpperCase() }}
                           </el-avatar>
                        </div>
                    </el-card>
                </div>
            </VueDraggable>
        </div>

        <div class="flex-1 min-w-[300px] bg-orange-50 rounded-xl p-3 flex flex-col border border-orange-100">
             <div class="flex justify-between items-center mb-3 px-1">
                <span class="font-bold text-orange-600 flex items-center gap-2">On Progress</span>
                <el-tag type="warning" round>{{ progressList.length }}</el-tag>
            </div>
             <VueDraggable 
                v-model="progressList"
                group="tasks" 
                @add="onAdd($event, 1)"
                class="flex-1 space-y-3 min-h-[100px]"
                ghost-class="ghost"
                :animation="150"
            >
                <div v-for="element in progressList" :key="element.id">
                    <el-card shadow="hover" class="cursor-pointer border-l-4 border-l-orange-500 rounded-lg mb-3" @click="openEditModal(element)">
                        <h4 class="font-bold text-gray-800 mb-1">{{ element.title }}</h4>
                        <p class="text-xs text-gray-500 line-clamp-2">{{ element.description }}</p>
                         <div class="flex justify-between items-center mt-3">
                           <el-tag size="small" type="warning">{{ new Date(element.deadline).toLocaleDateString() }}</el-tag>
                           <el-avatar v-if="element.assignedUser" :size="24" class="bg-orange-100 text-orange-600 text-xs">
                              {{ element.assignedUser.username.charAt(0).toUpperCase() }}
                           </el-avatar>
                        </div>
                    </el-card>
                </div>
            </VueDraggable>
        </div>

        <div class="flex-1 min-w-[300px] bg-slate-100 rounded-xl p-3 flex flex-col">
             <div class="flex justify-between items-center mb-3 px-1">
                <span class="font-bold text-green-600 flex items-center gap-2">Done</span>
                <el-tag type="success" round>{{ doneList.length }}</el-tag>
            </div>
             <VueDraggable 
                v-model="doneList"
                group="tasks" 
               @add="onAdd($event, 2)"
                class="flex-1 space-y-3 min-h-[100px]"
                ghost-class="ghost"
                :animation="150"
            >
                <div v-for="element in doneList" :key="element.id">
                    <el-card shadow="hover" class="cursor-pointer border-l-4 border-l-green-500 rounded-lg mb-3 opacity-70" @click="openEditModal(element)">
                        <h4 class="font-bold text-gray-500 line-through mb-1">{{ element.title }}</h4>
                        <div class="flex justify-end mt-2">
                           <el-tag size="small" type="success">Selesai</el-tag>
                        </div>
                    </el-card>
                </div>
            </VueDraggable>
        </div>

    </div>

    </div>
</template>

<style scoped>
.ghost { opacity: 0.5; background: #fff7ed; border: 2px dashed #f97316; }
</style>