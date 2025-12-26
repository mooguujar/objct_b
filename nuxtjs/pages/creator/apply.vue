<template>
  <div class="creator-apply-page min-h-screen bg-gray-50 pb-20">
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
        <h1 class="text-lg font-semibold text-gray-900">申请入驻</h1>
        <button
          class="px-4 py-1.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          :disabled="!canSubmit || submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </div>

    <div class="px-4 py-6 space-y-6">
      <!-- 用户资料展示 -->
      <div class="bg-white rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
            <img
              v-if="userInfo?.avatar"
              :src="userInfo.avatar"
              :alt="userInfo?.nickname"
              class="w-full h-full object-cover"
            />
            <el-icon v-else :size="24" class="text-white">
              <User />
            </el-icon>
          </div>
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">{{ userInfo?.userCode || '--' }}</div>
            <div class="text-xs text-gray-500 mt-1">认证后,成为创作者</div>
          </div>
        </div>
      </div>

      <!-- 创作者权益 -->
      <div class="bg-white rounded-lg p-4">
        <h2 class="text-base font-semibold text-gray-900 mb-4">创作者权益</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
            <div class="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center mb-2">
              <el-icon :size="24" class="text-white">
                <Trophy />
              </el-icon>
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">平台认证</div>
            <div class="text-xs text-gray-600 text-center">专属V+认证标识</div>
          </div>
          <div class="flex flex-col items-center p-4 bg-green-50 rounded-lg">
            <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <el-icon :size="24" class="text-white">
                <Grid />
              </el-icon>
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">开启岛屿</div>
            <div class="text-xs text-gray-600 text-center">成为岛主</div>
          </div>
          <div class="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <div class="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center mb-2">
              <el-icon :size="24" class="text-white">
                <Document />
              </el-icon>
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">动态发布</div>
            <div class="text-xs text-gray-600 text-center">流量扶持</div>
          </div>
          <div class="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
            <div class="w-12 h-12 rounded-full bg-purple-400 flex items-center justify-center mb-2">
              <el-icon :size="24" class="text-white">
                <Service />
              </el-icon>
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">专属客服</div>
            <div class="text-xs text-gray-600 text-center">1对1专属客服</div>
          </div>
        </div>
      </div>

      <!-- 上传截图 -->
      <div class="bg-white rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-base font-semibold text-gray-900">
            上传截图 <span class="text-sm font-normal text-gray-500">({{ uploadedImages.length }}/9)</span>
          </h2>
          <span class="text-xs text-gray-500">以下资料仅供内部审核,绝不外泄</span>
        </div>
        <div class="grid grid-cols-3 gap-3 mb-3">
          <div
            v-for="(image, index) in uploadedImages"
            :key="index"
            class="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            <img :src="image" alt="截图" class="w-full h-full object-cover" />
            <button
              class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              @click="removeImage(index)"
            >
              <el-icon :size="14">
                <Close />
              </el-icon>
            </button>
          </div>
          <div
            v-if="uploadedImages.length < 9"
            class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            @click="handleUploadClick"
          >
            <el-icon :size="32" class="text-gray-400">
              <Plus />
            </el-icon>
            <input
              ref="uploadInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleImageChange"
            />
          </div>
        </div>
        <p class="text-xs text-gray-500">
          上传自媒体平台个人主页链接或作品链接 (微博、快手、抖音、B站、小红书、头条等)
          最多可上传9张照片,至少上传1张
        </p>
      </div>

      <!-- 社交平台选择 -->
      <div class="bg-white rounded-lg p-4">
        <h2 class="text-base font-semibold text-gray-900 mb-3">请选择您主要活跃的社交平台</h2>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="platform in socialPlatforms"
            :key="platform.value"
            class="px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors"
            :class="
              selectedPlatforms.includes(platform.value)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            "
            @click="togglePlatform(platform.value)"
          >
            {{ platform.label }}
          </button>
        </div>
      </div>

      <!-- 社媒账号输入 -->
      <div class="bg-white rounded-lg p-4">
        <h2 class="text-base font-semibold text-gray-900 mb-3">
          请填写您的社媒平台账号 (如抖音号、快手号、B站号等)
        </h2>
        <input
          v-model="socialAccount"
          type="text"
          placeholder="请填写您的社媒平台账号"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="checkCanSubmit"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="py-8">
      <el-skeleton :rows="3" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStatistics } from '../../composables/useStatistics'
import { useApi } from '../../composables/useApi'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  User,
  Trophy,
  Grid,
  Document,
  Service,
  Plus,
  Close
} from '@element-plus/icons-vue'

// 使用认证中间件
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { request } = useApi()
const { trackPageView, trackClick } = useStatistics()
const authStore = useAuthStore()

const uploadInput = ref<HTMLInputElement>()

interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string | null
  userCode: string
}

const userInfo = ref<UserInfo | null>(null)
const loading = ref(false)
const submitting = ref(false)

const uploadedImages = ref<string[]>([])
const selectedPlatforms = ref<string[]>([])
const socialAccount = ref('')

const socialPlatforms = [
  { value: 'douyin', label: '抖音' },
  { value: 'kuaishou', label: '快手' },
  { value: 'bilibili', label: 'b站' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'weibo', label: '微博' },
  { value: 'other', label: '其他' }
]

// 是否可以提交
const canSubmit = computed(() => {
  return (
    uploadedImages.value.length >= 1 &&
    uploadedImages.value.length <= 9 &&
    selectedPlatforms.value.length > 0 &&
    socialAccount.value.trim().length > 0
  )
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await request<UserInfo>('/users/profile', {
      method: 'GET'
    })
    userInfo.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  }
}

// 加载已有申请
const loadApplication = async () => {
  try {
    const response = await request<{
      qualificationUrls: string[]
      socialPlatforms: string[]
      socialAccount: string
      status: string
    }>('/creator/apply', {
      method: 'GET'
    })

    if (response.data) {
      uploadedImages.value = response.data.qualificationUrls || []
      selectedPlatforms.value = response.data.socialPlatforms || []
      socialAccount.value = response.data.socialAccount || ''

      if (response.data.status === 'pending') {
        ElMessage.warning('您已有待审核的申请')
      } else if (response.data.status === 'approved') {
        ElMessage.success('您的申请已通过审核')
      } else if (response.data.status === 'rejected') {
        ElMessage.warning('您的申请已被拒绝，可以重新提交')
      }
    }
  } catch (error: any) {
    // 如果没有申请记录，忽略错误
    if (error.statusCode !== 404) {
      console.error('加载申请失败:', error)
    }
  }
}

// 检查是否可以提交
const checkCanSubmit = () => {
  // 触发响应式更新
}

// 返回
const handleBack = () => {
  trackClick({
    elementId: 'back-button',
    elementType: 'button',
    pagePath: '/creator/apply',
    content: { action: 'back' }
  })
  router.back()
}

// 点击上传
const handleUploadClick = () => {
  trackClick({
    elementId: 'upload-screenshot',
    elementType: 'button',
    pagePath: '/creator/apply',
    content: { action: 'upload-screenshot' }
  })
  uploadInput.value?.click()
}

// 图片文件变化
const handleImageChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  const remainingSlots = 9 - uploadedImages.value.length
  const filesToUpload = Array.from(files).slice(0, remainingSlots)

  if (files.length > remainingSlots) {
    ElMessage.warning(`最多只能上传${remainingSlots}张图片`)
  }

  for (const file of filesToUpload) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件')
      continue
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过10MB')
      continue
    }

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const token = authStore.token || (process.client ? localStorage.getItem('token') : null)

      const response = await $fetch<{ code: number; message: string; data: { url: string } }>(
        '/api/upload/qualification',
        {
          method: 'POST',
          body: uploadFormData,
          headers: token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {}
        }
      )

      if (response.code === 200) {
        uploadedImages.value.push(response.data.url)
        checkCanSubmit()
      }
    } catch (error: any) {
      ElMessage.error(error.message || '上传失败')
    }
  }

  // 重置input
  target.value = ''
}

// 删除图片
const removeImage = (index: number) => {
  trackClick({
    elementId: 'remove-image',
    elementType: 'button',
    pagePath: '/creator/apply',
    content: { action: 'remove-image', index }
  })
  uploadedImages.value.splice(index, 1)
  checkCanSubmit()
}

// 切换平台
const togglePlatform = (platform: string) => {
  trackClick({
    elementId: `platform-${platform}`,
    elementType: 'button',
    pagePath: '/creator/apply',
    content: { action: 'toggle-platform', platform }
  })

  const index = selectedPlatforms.value.indexOf(platform)
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1)
  } else {
    selectedPlatforms.value.push(platform)
  }
  checkCanSubmit()
}

// 提交申请
const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return

  trackClick({
    elementId: 'submit-application',
    elementType: 'button',
    pagePath: '/creator/apply',
    content: {
      action: 'submit-application',
      imageCount: uploadedImages.value.length,
      platformCount: selectedPlatforms.value.length
    }
  })

  submitting.value = true
  try {
    await request('/creator/apply', {
      method: 'POST',
      body: {
        qualificationUrls: uploadedImages.value,
        socialPlatforms: selectedPlatforms.value,
        socialAccount: socialAccount.value.trim()
      }
    })

    ElMessage.success('申请提交成功，请等待审核')
    router.back()
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // 记录页面访问（仅在客户端）
  if (process.client) {
    trackPageView({
      pagePath: '/creator/apply',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      device: 'web'
    })
  }

  // 加载用户信息和已有申请
  await Promise.all([loadUserInfo(), loadApplication()])
})
</script>

<style scoped>
.creator-apply-page {
  background: linear-gradient(to bottom, #fef9e7 0%, #e8f5e9 50%, #e3f2fd 100%);
}
</style>

