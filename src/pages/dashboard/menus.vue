<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useMenuStore } from '@/shared/stores/menu.store'
import { ElMessageBox } from 'element-plus'
import type { Menu } from '@/shared/types/menu.types'

const menuStore = useMenuStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const formLoading = ref(false)

const form = reactive({
    name: '',
    label: '',
    icon: 'ri-checkbox-blank-circle-line'
})

onMounted(() => {
    menuStore.fetchMenus()
})

// --- Modal Logic ---
const openCreate = () => {
    isEdit.value = false
    form.name = ''
    form.label = ''
    form.icon = ''
    dialogVisible.value = true
}

const openEdit = (menu: Menu) => {
    isEdit.value = true
    editId.value = menu.id
    form.name = menu.name
    form.label = menu.label
    dialogVisible.value = true
}

const handleSubmit = async () => {
    if (!form.name || !form.label) {
        ElMessageBox.alert('Semua field wajib diisi')
        return
    }

    formLoading.value = true
    let success = false

    if (isEdit.value && editId.value) {
        success = await menuStore.updateMenu(editId.value, form)
    } else {
        success = await menuStore.createMenu(form)
    }

    formLoading.value = false
    if (success) dialogVisible.value = false
}

const handleDelete = (menu: Menu) => {
    ElMessageBox.confirm(
        `Hapus menu "${menu.label}"? Role yang pakai menu ini akan kehilangan akses.`,
        'Warning',
        { confirmButtonText: 'Hapus', cancelButtonText: 'Batal', type: 'warning' }
    ).then(() => {
        menuStore.deleteMenu(menu.id)
    })
}
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Manajemen Menu Sistem</h1>
                <p class="text-gray-400 text-sm">Daftarkan fitur/halaman baru agar bisa diassign ke Role.</p>
            </div>
            <el-button type="primary" size="large" @click="openCreate">
                <i class="ri-add-circle-line mr-2"></i> Tambah Menu
            </el-button>
        </div>

        <el-alert title="Info Developer" type="info"
            description="Pastikan 'Kode Menu' (name) sama persis dengan yang dikoding di Frontend Route dan Database Seeding."
            show-icon class="mb-6" />

        <el-card shadow="never" class="border-none rounded-xl">
            <el-table :data="menuStore.menus" v-loading="menuStore.loading" size="large" stripe>

                <el-table-column label="ID" prop="id" width="80" />

                <el-table-column label="Label Tampilan (Frontend)">
                    <template #default="scope">
                        <div class="font-bold text-gray-700">{{ scope.row.label }}</div>
                    </template>
                </el-table-column>

                <el-table-column label="Kode System (Database)">
                    <template #default="scope">
                        <el-tag type="info" class="font-mono">{{ scope.row.name }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="Aksi" align="center" width="150">
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

        <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Menu' : 'Tambah Menu Baru'" width="450px">
            <el-form label-position="top">
                <el-form-item label="Label Tampilan">
                    <el-input v-model="form.label" placeholder="Contoh: Laporan Keuangan">
                        <template #prefix><i class="ri-text"></i></template>
                    </el-input>
                    <span class="text-xs text-gray-400">Nama yang muncul di Sidebar kiri.</span>
                </el-form-item>

                <el-form-item label="Kode System (Unik)">
                    <el-input v-model="form.name" placeholder="Contoh: finance_report">
                        <template #prefix><i class="ri-code-s-slash-line"></i></template>
                    </el-input>
                    <span class="text-xs text-gray-400">Digunakan untuk mapping route & permission database. Jangan
                        pakai
                        spasi.</span>
                </el-form-item>
                <el-form-item label="Icon (Remix Icon Class)">
                    <el-input v-model="form.icon" placeholder="Contoh: ri-money-dollar-circle-line">
                        <template #prefix>
                            <i :class="form.icon || 'ri-search-line'"></i>
                        </template>
                    </el-input>
                    <div class="mt-1 text-xs text-gray-400">
                        Cari nama icon di:
                        <a href="https://remixicon.com/" target="_blank"
                            class="text-blue-500 underline">RemixIcon.com</a>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">Batal</el-button>
                <el-button type="primary" :loading="formLoading" @click="handleSubmit">Simpan</el-button>
            </template>
        </el-dialog>
    </div>
</template>