<template>
  <div class="edit-profile-page min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 bg-white z-50 border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-3">
        <el-icon
          class="cursor-pointer text-gray-700 hover:text-gray-900"
          :size="20"
          @click="handleBack"
        >
          <ArrowLeft />
        </el-icon>
        <h1 class="text-lg font-semibold text-gray-900">编辑资料</h1>
        <button
          class="px-4 py-1.5 rounded-lg text-sm transition-colors"
          :class="
            hasChanges
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          "
          :disabled="!hasChanges || saving"
          @click="handleSave"
        >
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>

    <div class="px-4 py-6">
      <!-- 头像区域 -->
      <div class="flex justify-center mb-8">
        <div class="relative">
          <div class="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
            <img
              v-if="formData.avatar"
              :src="formData.avatar"
              alt="头像"
              class="w-full h-full object-cover"
            />
            <el-icon v-else :size="48" class="text-white">
              <User />
            </el-icon>
          </div>
          <div
            class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
            @click="handleAvatarClick"
          >
            <el-icon :size="16" class="text-white">
              <Camera />
            </el-icon>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          />
        </div>
      </div>

      <!-- 个人信息 -->
      <div class="bg-white rounded-lg overflow-hidden mb-4">
        <!-- 我的昵称 -->
        <div class="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <span class="text-sm text-gray-900">我的昵称</span>
          <input
            v-model="formData.nickname"
            type="text"
            class="flex-1 text-right text-sm text-gray-700 border-none outline-none bg-transparent"
            placeholder="请输入昵称"
            @input="checkChanges"
          />
        </div>

        <!-- 出生日期 -->
        <div
          class="flex items-center justify-between px-4 py-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
          @click="showDatePickerDialog = true"
        >
          <span class="text-sm text-gray-900">出生日期</span>
          <div class="flex items-center gap-2">
            <span class="text-sm" :class="formData.birthday ? 'text-gray-700' : 'text-gray-400'">
              {{ formData.birthday || '未选择' }}
            </span>
            <el-icon :size="16" class="text-gray-400">
              <ArrowRight />
            </el-icon>
          </div>
        </div>

        <!-- 性别 -->
        <div
          class="flex items-center justify-between px-4 py-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
          @click="showGenderPicker = true"
        >
          <div class="flex flex-col">
            <span class="text-sm text-gray-900">性别</span>
            <span v-if="!formData.gender || formData.gender === 0" class="text-xs text-gray-500 mt-1">
              (只能修改一次,请谨慎修改)
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm" :class="getGenderText() ? 'text-gray-700' : 'text-gray-400'">
              {{ getGenderText() || '未选择' }}
            </span>
            <el-icon :size="16" class="text-gray-400">
              <ArrowRight />
            </el-icon>
          </div>
        </div>

        <!-- 联系方式设置 -->
        <div
          class="flex items-center justify-between px-4 py-5 cursor-pointer hover:bg-gray-50"
          @click="handleContactSettings"
        >
          <span class="text-sm text-gray-900">联系方式设置</span>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">
              {{ hasContactInfo ? '已设置' : '未设置' }}
            </span>
            <el-icon :size="16" class="text-gray-400">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 主页背景图 -->
      <div class="bg-white rounded-lg p-4">
        <h2 class="text-sm font-medium text-gray-900 mb-3">主页背景图</h2>
        <div
          class="w-full h-40 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden"
          @click="handleBackgroundClick"
        >
          <img
            v-if="formData.backgroundImage"
            :src="formData.backgroundImage"
            alt="背景图"
            class="w-full h-full object-cover"
          />
          <div v-else class="flex flex-col items-center gap-2">
            <el-icon :size="32" class="text-gray-400">
              <Plus />
            </el-icon>
          </div>
          <input
            ref="backgroundInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleBackgroundChange"
          />
        </div>
      </div>
    </div>


    <!-- 日期选择对话框 -->
    <el-dialog v-model="showDatePickerDialog" title="选择出生日期" width="80%">
      <el-date-picker
        v-model="datePickerValue"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="w-full"
        @change="handleDateChange"
      />
      <template #footer>
        <el-button @click="showDatePickerDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmDate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 性别选择对话框 -->
    <el-dialog v-model="showGenderPicker" title="选择性别" width="80%">
      <div class="space-y-3">
        <div
          class="p-4 rounded-lg border-2 cursor-pointer transition-colors"
          :class="
            formData.gender === 1
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          "
          @click="selectGender(1)"
        >
          <span class="text-base">男</span>
        </div>
        <div
          class="p-4 rounded-lg border-2 cursor-pointer transition-colors"
          :class="
            formData.gender === 2
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          "
          @click="selectGender(2)"
        >
          <span class="text-base">女</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showGenderPicker = false">取消</el-button>
        <el-button type="primary" @click="confirmGender">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStatistics } from '../../composables/useStatistics'
import { useApi } from '../../composables/useApi'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  User,
  Camera,
  ArrowRight,
  Plus
} from '@element-plus/icons-vue'

// 使用认证中间件
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { request } = useApi()
const { trackPageView, trackClick } = useStatistics()

const avatarInput = ref<HTMLInputElement>()
const backgroundInput = ref<HTMLInputElement>()

const originalData = ref<any>(null)
const formData = ref({
  nickname: '',
  avatar: '',
  birthday: '',
  gender: 0,
  backgroundImage: '',
  phone: '',
  email: ''
})

const saving = ref(false)
const showDatePickerDialog = ref(false)
const showGenderPicker = ref(false)
const datePickerValue = ref('')
const selectedGender = ref(0)

// 检查是否有变更
const hasChanges = computed(() => {
  if (!originalData.value) return false
  return (
    formData.value.nickname !== originalData.value.nickname ||
    formData.value.avatar !== originalData.value.avatar ||
    formData.value.birthday !== originalData.value.birthday ||
    formData.value.gender !== originalData.value.gender ||
    formData.value.backgroundImage !== originalData.value.backgroundImage
  )
})

const hasContactInfo = computed(() => {
  return !!(formData.value.phone || formData.value.email)
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await request('/users/profile', {
      method: 'GET'
    })
    const data = response.data
    originalData.value = {
      nickname: data.nickname,
      avatar: data.avatar || '',
      birthday: data.birthday || '',
      gender: data.gender || 0,
      backgroundImage: data.backgroundImage || '',
      phone: data.phone || '',
      email: data.email || ''
    }
    formData.value = { ...originalData.value }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  }
}

// 检查变更
const checkChanges = () => {
  // 触发响应式更新
}

// 返回
const handleBack = () => {
  if (hasChanges.value) {
    ElMessageBox.confirm('有未保存的更改，确定要离开吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        router.back()
      })
      .catch(() => {})
  } else {
    router.back()
  }
}

// 保存
const handleSave = async () => {
  if (!hasChanges.value || saving.value) return

  saving.value = true
  try {
    await request('/users/profile', {
      method: 'PUT',
      body: {
        nickname: formData.value.nickname,
        avatar: formData.value.avatar,
        birthday: formData.value.birthday || null,
        gender: formData.value.gender,
        backgroundImage: formData.value.backgroundImage
      }
    })

    ElMessage.success('保存成功')
    originalData.value = { ...formData.value }
    router.back()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 点击头像
const handleAvatarClick = () => {
  trackClick({
    elementId: 'avatar-upload',
    elementType: 'button',
    pagePath: '/profile/edit',
    content: { action: 'upload-avatar' }
  })
  avatarInput.value?.click()
}

// 头像文件变化
const handleAvatarChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  try {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    const response = await $fetch<{ code: number; message: string; data: { url: string } }>(
      '/api/upload/avatar',
      {
        method: 'POST',
        body: uploadFormData
      }
    )

    if (response.code === 200) {
      ElMessage.success('上传成功')
      formData.value.avatar = response.data.url
      checkChanges()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
  }

  // 重置input
  target.value = ''
}


// 点击背景图
const handleBackgroundClick = () => {
  trackClick({
    elementId: 'background-upload',
    elementType: 'button',
    pagePath: '/profile/edit',
    content: { action: 'upload-background' }
  })
  backgroundInput.value?.click()
}

// 背景图文件变化
const handleBackgroundChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过10MB')
    return
  }

  try {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    const response = await $fetch<{ code: number; message: string; data: { url: string } }>(
      '/api/upload/background',
      {
        method: 'POST',
        body: uploadFormData
      }
    )

    if (response.code === 200) {
      ElMessage.success('上传成功')
      formData.value.backgroundImage = response.data.url
      checkChanges()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
  }

  // 重置input
  target.value = ''
}

// 日期变化
const handleDateChange = (value: string) => {
  datePickerValue.value = value || ''
}

// 确认日期
const confirmDate = () => {
  formData.value.birthday = datePickerValue.value || ''
  showDatePickerDialog.value = false
  checkChanges()
}

// 选择性别
const selectGender = (gender: number) => {
  selectedGender.value = gender
}

// 确认性别
const confirmGender = () => {
  formData.value.gender = selectedGender.value
  showGenderPicker.value = false
  checkChanges()
}

// 获取性别文本
const getGenderText = () => {
  if (formData.value.gender === 1) return '男'
  if (formData.value.gender === 2) return '女'
  return ''
}

// 联系方式设置
const handleContactSettings = () => {
  trackClick({
    elementId: 'contact-settings',
    elementType: 'button',
    pagePath: '/profile/edit',
    content: { action: 'contact-settings' }
  })
  ElMessage.info('联系方式设置功能开发中')
}

// 初始化日期选择器值
watch(showDatePickerDialog, (val) => {
  if (val) {
    datePickerValue.value = formData.value.birthday || ''
  }
})

onMounted(async () => {
  // 记录页面访问
  trackPageView({
    pagePath: '/profile/edit',
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    device: 'web'
  })

  // 加载用户信息
  await loadUserInfo()
})
</script>

<style scoped>
.edit-profile-page {
  padding-bottom: 20px;
}
</style>

