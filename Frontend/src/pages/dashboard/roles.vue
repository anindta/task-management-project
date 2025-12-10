<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRoleStore } from '@/shared/stores/role.store'
import { ElMessageBox } from 'element-plus'
import type { Role } from '@/shared/types/role.types'

const roleStore = useRoleStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const formLoading = ref(false)

// Form State
const form = reactive({
  name: '',
  menuIds: [] as number[] // Array ID menu yang dicentang
})

// Setup: Load Data
onMounted(() => {
  roleStore.fetchRoles()
  roleStore.fetchAvailableMenus()
})

// --- Logic Modal ---
const openCreateModal = () => {
  isEdit.value = false
  editId.value = null
  form.name = ''
  form.menuIds = [] // Reset checkbox
  dialogVisible.value = true
}

const openEditModal = (role: Role) => {
  isEdit.value = true
  editId.value = role.id
  form.name = role.name
  // Backend mengirim array ID menu yang dimiliki role ini, kita pasang ke form
  form.menuIds = [...role.menuIds] 
  dialogVisible.value = true
}

// --- Submit Form ---
const handleSubmit = async () => {
  if (!form.name) {
      ElMessageBox.alert('Nama Role wajib diisi')
      return
  }

  formLoading.value = true
  let success = false

  const payload = {
      name: form.name,
      menuIds: form.menuIds
  }

  if (isEdit.value && editId.value) {
    success = await roleStore.updateRole(editId.value, payload)
  } else {
    success = await roleStore.createRole(payload)
  }

  formLoading.value = false
  if (success) dialogVisible.value = false
}

// --- Delete ---
const handleDelete = (role: Role) => {
  ElMessageBox.confirm(
    `Hapus role "${role.name}"? User dengan role ini akan kehilangan akses.`,
    'Warning',
    {
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      type: 'warning',
    }
  ).then(() => {
    roleStore.deleteRole(role.id)
  })
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Role & Permission</h1>
        <p class="text-gray-400 text-sm">Atur hak akses menu untuk setiap jabatan.</p>
      </div>
      <el-button type="primary" size="large" @click="openCreateModal">
        <i class="ri-shield-keyhole-line mr-2"></i> Tambah Role Baru
      </el-button>
    </div>

    <el-card shadow="never" class="border-none rounded-xl">
      <el-table :data="roleStore.roles" v-loading="roleStore.loading" size="large">
        
        <el-table-column label="Nama Role" width="200">
          <template #default="scope">
            <div class="flex items-center gap-2 font-bold text-gray-700">
               <i class="ri-vip-crown-line text-orange-500 text-lg"></i>
               {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Hak Akses Menu">
          <template #default="scope">
            <div class="flex flex-wrap gap-2">
              <el-tag 
                v-for="(label, index) in scope.row.menuLabels" 
                :key="index"
                type="info" 
                effect="plain"
                round
              >
                {{ label }}
              </el-tag>
              <span v-if="scope.row.menuLabels.length === 0" class="text-xs text-gray-400 italic">
                Tidak ada akses menu
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Aksi" width="150" align="center">
          <template #default="scope">
             <el-button-group>
              <el-button type="primary" link @click="openEditModal(scope.row)">
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
      :title="isEdit ? 'Edit Role & Izin' : 'Buat Role Baru'"
      width="500px"
      destroy-on-close
    >
      <el-form label-position="top">
        
        <el-form-item label="Nama Role">
          <el-input v-model="form.name" placeholder="Contoh: HRD Staff" size="large">
             <template #prefix><i class="ri-id-card-line"></i></template>
          </el-input>
        </el-form-item>

        <el-form-item label="Pilih Menu yang Boleh Diakses:">
          <el-card shadow="never" class="w-full bg-slate-50 border border-slate-200">
             <el-checkbox-group v-model="form.menuIds" class="flex flex-col gap-2">
                <el-checkbox 
                    v-for="menu in roleStore.availableMenus" 
                    :key="menu.id" 
                    :label="menu.id"
                    size="large"
                    border
                    class="!ml-0 bg-white"
                >
                    <span class="font-medium text-gray-700">{{ menu.label }}</span>
                </el-checkbox>
             </el-checkbox-group>
          </el-card>
        </el-form-item>

      </el-form>

      <template #footer>
        <span>
          <el-button @click="dialogVisible = false">Batal</el-button>
          <el-button type="primary" :loading="formLoading" @click="handleSubmit">
            Simpan Perubahan
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>