<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue'
import { useUserStore } from '@/shared/stores/user.store'
import { ElMessageBox } from 'element-plus'
import type { User } from '@/shared/types/user.types'


const userStore = useUserStore()

// State untuk Modal & Form
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const formLoading = ref(false)

const form = reactive({
  username: '',
  email: '',
  role: 'Employee',
  password: ''
})

// Setup Awal
onMounted(() => {
  userStore.fetchUsers()
  userStore.fetchRoles()
})

// --- Logic Form ---
const openCreateModal = () => {
  isEdit.value = false
  form.username = ''
  form.email = ''
  form.role = 'Employee'
  form.password = '' // Password wajib saat create
  dialogVisible.value = true
}

const openEditModal = (user: User) => {
  isEdit.value = true
  editId.value = user.id
  form.username = user.username
  form.email = user.email
  form.role = user.role
  form.password = '' // Kosongkan, kalau diisi berarti user mau ganti password
  dialogVisible.value = true
}

const handleSubmit = async () => {
  formLoading.value = true
  let success = false

  // Validasi sederhana
  if (!form.username || !form.email) {
      ElMessageBox.alert('Username dan Email wajib diisi')
      formLoading.value = false
      return
  }

  if (isEdit.value && editId.value) {
    success = await userStore.updateUser(editId.value, form)
  } else {
    if (!form.password) {
        ElMessageBox.alert('Password wajib diisi untuk user baru')
        formLoading.value = false
        return
    }
    success = await userStore.createUser(form)
  }

  formLoading.value = false
  if (success) dialogVisible.value = false
}

// --- Logic Delete ---
const handleDelete = (user: User) => {
  ElMessageBox.confirm(
    `Yakin ingin menghapus user ${user.username}?`,
    'Warning',
    {
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      type: 'warning',
    }
  ).then(() => {
    userStore.deleteUser(user.id)
  })
}

// Helper Warna Badge Role
const getRoleTag = (roleName: string) => {
    if (roleName === 'Admin') return 'danger'
    if (roleName === 'ProjectManager') return 'warning'
    return 'info'
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manajemen User</h1>
        <p class="text-gray-400 text-sm">Kelola pengguna dan hak akses sistem.</p>
      </div>
      <el-button type="primary" size="large" @click="openCreateModal">
        <i class="ri-user-add-line mr-2"></i> Tambah User
      </el-button>
    </div>

    <el-card shadow="never" class="border-none rounded-xl">
      <el-table :data="userStore.users" v-loading="userStore.loading" style="width: 100%" size="large">
        
        <el-table-column label="Pengguna" min-width="200">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <el-avatar class="bg-orange-100 text-orange-600 font-bold">
                {{ scope.row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div>
                <div class="font-bold text-gray-700">{{ scope.row.username }}</div>
                <div class="text-xs text-gray-400">ID: {{ scope.row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="Email" min-width="200">
           <template #default="scope">
             <div class="flex items-center gap-2 text-gray-600">
               <i class="ri-mail-line"></i> {{ scope.row.email }}
             </div>
           </template>
        </el-table-column>

        <el-table-column label="Role" width="180">
          <template #default="scope">
            <el-tag :type="getRoleTag(scope.row.role)" effect="light" round>
              {{ scope.row.role }}
            </el-tag>
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
      :title="isEdit ? 'Edit Data User' : 'Tambah User Baru'"
      width="500px"
      destroy-on-close
    >
      <el-form label-position="top" size="large">
        
        <el-form-item label="Username">
          <el-input v-model="form.username" placeholder="Contoh: budi_santoso" :disabled="isEdit">
            <template #prefix><i class="ri-user-line"></i></template>
          </el-input>
        </el-form-item>

        <el-form-item label="Email">
          <el-input v-model="form.email" placeholder="Contoh: budi@kantor.com">
            <template #prefix><i class="ri-mail-line"></i></template>
          </el-input>
        </el-form-item>

        <el-form-item label="Role">
          <el-select v-model="form.role" placeholder="Pilih Role" class="w-full">
            <template #prefix><i class="ri-shield-user-line"></i></template>
            <el-option 
                v-for="role in userStore.rolesList" 
                :key="role.id" 
                :label="role.name" 
                :value="role.name" 
            />
            <el-option label="Admin" value="Admin" />
            <el-option label="Project Manager" value="ProjectManager" />
            <el-option label="Employee" value="Employee" />
          </el-select>
        </el-form-item>

        <el-form-item :label="isEdit ? 'Password (Kosongkan jika tidak diubah)' : 'Password'">
          <el-input v-model="form.password" type="password" show-password placeholder="••••••">
            <template #prefix><i class="ri-lock-password-line"></i></template>
          </el-input>
        </el-form-item>

      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Batal</el-button>
          <el-button type="primary" :loading="formLoading" @click="handleSubmit">
            Simpan Data
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>