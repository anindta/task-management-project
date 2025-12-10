<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useProjectStore } from '@/shared/stores/project.store'
import { ElMessageBox } from 'element-plus'

const projectStore = useProjectStore()
const dialogVisible = ref(false)
const formLoading = ref(false)

const form = reactive({
    name: '',
    description: ''
})

onMounted(() => {
    projectStore.fetchProjects()
})

const openCreate = () => {
    form.name = ''
    form.description = ''
    dialogVisible.value = true
}

const handleSubmit = async () => {
    if (!form.name) return
    formLoading.value = true
    const success = await projectStore.createProject(form)
    formLoading.value = false
    if (success) dialogVisible.value = false
}

const handleDelete = (id: number) => {
    ElMessageBox.confirm('Hapus proyek ini beserta semua tugas di dalamnya?', 'Warning', {
        confirmButtonText: 'Hapus',
        type: 'warning'
    }).then(() => projectStore.deleteProject(id))
}
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Daftar Proyek</h1>
                <p class="text-gray-400 text-sm">Kelola proyek tim Anda.</p>
            </div>
            <el-button type="primary" size="large" @click="openCreate">
                <i class="ri-folder-add-line mr-2"></i> Proyek Baru
            </el-button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <el-card v-for="project in projectStore.projects" :key="project.id" shadow="hover"
                class="rounded-xl border-none relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                body-style="padding: 20px;">
                <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <el-popconfirm title="Yakin hapus proyek ini?" confirm-button-text="Ya" cancel-button-text="Batal"
                        @confirm="handleDelete(project.id)">
                        <template #reference>
                            <el-button type="danger" circle size="small" plain>
                                <i class="ri-delete-bin-line"></i>
                            </el-button>
                        </template>
                    </el-popconfirm>
                </div>

                <div class="flex items-start gap-4 mb-3">
                    <div
                        class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 text-2xl flex-shrink-0 border border-orange-100">
                        <i class="ri-folder-3-fill"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-lg text-slate-800 truncate" :title="project.name">
                            {{ project.name }}
                        </h3>
                        <span class="text-xs text-slate-400">Update terakhir: Baru saja</span>
                    </div>
                </div>

                <p class="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px] leading-relaxed">
                    {{ project.description || 'Tidak ada deskripsi untuk proyek ini.' }}
                </p>

                <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span class="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        ID: {{ project.id }}
                    </span>

                    <div class="flex gap-2">
                        <el-tooltip content="Buka Kanban Board" placement="top">
                            <el-button size="small" plain
                                @click="$router.push({ path: '/board', query: { projectId: project.id } })">
                                <i class="ri-kanban-view text-lg text-slate-500"></i>
                            </el-button>
                        </el-tooltip>

                        <el-button type="primary" size="small" round @click="$router.push(`/projects/${project.id}`)"
                            class="!px-4">
                            Tasks <i class="ri-arrow-right-line ml-1"></i>
                        </el-button>
                    </div>
                </div>

            </el-card>
        </div>

        <el-dialog v-model="dialogVisible" title="Buat Proyek Baru" width="400px">
            <el-form label-position="top">
                <el-form-item label="Nama Proyek">
                    <el-input v-model="form.name" placeholder="Website Company Profile" />
                </el-form-item>
                <el-form-item label="Deskripsi">
                    <el-input v-model="form.description" type="textarea" placeholder="Detail singkat..." />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">Batal</el-button>
                <el-button type="primary" :loading="formLoading" @click="handleSubmit">Simpan</el-button>
            </template>
        </el-dialog>
    </div>
</template>