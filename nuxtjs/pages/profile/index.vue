<template>
  <div class="profile-page min-h-screen pb-20">
    <!-- 顶部用户信息区域（带渐变背景或背景图） -->
    <div
      class="top-section"
      :class="userInfo?.backgroundImage ? 'bg-cover bg-center bg-no-repeat' : 'bg-gradient-to-r from-yellow-100 via-green-100 to-blue-100'"
      :style="userInfo?.backgroundImage ? { backgroundImage: `url(${userInfo.backgroundImage})` } : {}"
    >
      <div class="px-4 pt-4 pb-6">
        <!-- 用户头像和ID -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative"
              @click="handleAvatarClick"
            >
              <img
                v-if="userInfo?.avatar"
                :src="userInfo.avatar"
                :alt="userInfo?.nickname"
                class="w-full h-full object-cover pointer-events-none"
              />
              <el-icon v-else :size="32" class="text-white pointer-events-none">
                <User />
              </el-icon>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">{{ userInfo?.userCode || '--' }}</div>
            </div>
          </div>
          <button
            class="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            @click="handleMyHomepage"
          >
            我的主页 >
          </button>
        </div>

        <!-- 统计数据 -->
        <div class="flex items-center gap-6">
          <div class="text-center">
            <div class="text-base font-semibold text-gray-900">{{ userInfo?.followCount || 0 }}</div>
            <div class="text-xs text-gray-600 mt-1">关注</div>
          </div>
          <div class="text-center">
            <div class="text-base font-semibold text-gray-900">{{ userInfo?.followerCount || 0 }}</div>
            <div class="text-xs text-gray-600 mt-1">粉丝</div>
          </div>
          <div class="text-center">
            <div class="text-base font-semibold text-gray-900">{{ userInfo?.likeCount || 0 }}</div>
            <div class="text-xs text-gray-600 mt-1">获赞</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 金币余额栏 -->
    <div class="coin-balance-bar bg-yellow-400 px-4 py-3 flex items-center justify-between">
      <span class="text-sm font-medium text-gray-900">金币余额</span>
      <div class="flex items-center gap-2 cursor-pointer" @click="handleCoinClick">
        <el-icon :size="18" class="text-yellow-600">
          <Money />
        </el-icon>
        <span class="text-sm font-semibold text-gray-900">{{ userInfo?.coinBalance || 0 }}</span>
        <el-icon :size="14" class="text-gray-600">
          <ArrowRight />
        </el-icon>
      </div>
    </div>

    <!-- 快捷功能 -->
    <div class="quick-actions bg-white px-4 py-4">
      <div class="grid grid-cols-3 gap-4">
        <div
          class="flex flex-col items-center gap-2 cursor-pointer"
          @click="handleMyActivity"
        >
          <div class="w-12 h-12 rounded-lg bg-teal-400 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <Document />
            </el-icon>
          </div>
          <span class="text-xs text-gray-700">我的动态</span>
        </div>
        <div
          class="flex flex-col items-center gap-2 cursor-pointer"
          @click="handleMyVIP"
        >
          <div class="w-12 h-12 rounded-lg bg-orange-400 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <Trophy />
            </el-icon>
          </div>
          <span class="text-xs text-gray-700">我的VIP</span>
        </div>
        <div
          class="flex flex-col items-center gap-2 cursor-pointer"
          @click="handleMyFavorites"
        >
          <div class="w-12 h-12 rounded-lg bg-pink-400 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <Star />
            </el-icon>
          </div>
          <span class="text-xs text-gray-700">我的收藏</span>
        </div>
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list bg-white mt-2">
      <div
        v-for="menu in menuItems"
        :key="menu.key"
        class="menu-item flex items-center justify-between px-4 py-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        @click="handleMenuClick(menu)"
      >
        <div class="flex items-center gap-3">
          <el-icon :size="20" class="text-gray-600">
            <component :is="menu.icon" />
          </el-icon>
          <span class="text-sm text-gray-900">{{ menu.label }}</span>
        </div>
        <el-icon :size="16" class="text-gray-400">
          <ArrowRight />
        </el-icon>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="py-8">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 底部导航栏 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStatistics } from '../../composables/useStatistics'
import { useApi } from '../../composables/useApi'
import { ElMessage } from 'element-plus'
import {
  User,
  Money,
  ArrowRight,
  Document,
  Trophy,
  Star,
  Plus,
  UserFilled,
  Service,
  Setting
} from '@element-plus/icons-vue'
import BottomNav from '../../components/BottomNav.vue'

// 使用认证中间件
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { request } = useApi()
const { trackPageView, trackClick } = useStatistics()

interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string | null
  bio: string | null
  backgroundImage: string | null
  userCode: string
  coinBalance: number
  followCount: number
  followerCount: number
  likeCount: number
  postCount: number
  isVerified: boolean
  role: string
  createdAt: string
}

const userInfo = ref<UserInfo | null>(null)
const loading = ref(false)

const menuItems = [
  { key: 'add-to-home', label: '添加到主屏幕', icon: Plus },
  { key: 'creator-apply', label: '达人申请入驻', icon: UserFilled },
  { key: 'agent-apply', label: '代理申请入驻', icon: UserFilled },
  { key: 'customer-service', label: '在线客服', icon: Service },
  { key: 'settings', label: '设置', icon: Setting }
]

// 加载用户信息
const loadUserInfo = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const response = await request<UserInfo>('/users/profile', {
      method: 'GET'
    })
    userInfo.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 点击头像
const handleAvatarClick = () => {
  trackClick({
    elementId: 'avatar-click',
    elementType: 'image',
    pagePath: '/profile',
    content: { action: 'edit-profile' }
  })
  router.push('/profile/edit')
}

// 我的主页
const handleMyHomepage = () => {
  trackClick({
    elementId: 'my-homepage',
    elementType: 'button',
    pagePath: '/profile',
    content: { action: 'my-homepage' }
  })
  // TODO: 跳转到个人主页详情页
  router.push(`/users/${userInfo.value?.id}`)
}

// 金币点击
const handleCoinClick = () => {
  trackClick({
    elementId: 'coin-balance',
    elementType: 'button',
    pagePath: '/profile',
    content: { action: 'coin-balance' }
  })
  // TODO: 跳转到金币详情页
  ElMessage.info('金币详情功能开发中')
}

// 我的动态
const handleMyActivity = () => {
  trackClick({
    elementId: 'my-activity',
    elementType: 'button',
    pagePath: '/profile',
    content: { action: 'my-activity' }
  })
  // TODO: 跳转到我的动态页
  router.push(`/users/${userInfo.value?.id}/posts`)
}

// 我的VIP
const handleMyVIP = () => {
  trackClick({
    elementId: 'my-vip',
    elementType: 'button',
    pagePath: '/profile',
    content: { action: 'my-vip' }
  })
  // TODO: 跳转到VIP页面
  ElMessage.info('VIP功能开发中')
}

// 我的收藏
const handleMyFavorites = () => {
  trackClick({
    elementId: 'my-favorites',
    elementType: 'button',
    pagePath: '/profile',
    content: { action: 'my-favorites' }
  })
  // TODO: 跳转到收藏页
  router.push(`/users/${userInfo.value?.id}/collections`)
}

// 菜单点击
const handleMenuClick = (menu: { key: string; label: string }) => {
  trackClick({
    elementId: `menu-${menu.key}`,
    elementType: 'menu',
    pagePath: '/profile',
    content: { action: menu.key, label: menu.label }
  })

  switch (menu.key) {
    case 'add-to-home':
      ElMessage.info('添加到主屏幕功能开发中')
      break
    case 'creator-apply':
      router.push('/creator/apply')
      break
    case 'agent-apply':
      router.push('/agent/apply')
      break
    case 'customer-service':
      ElMessage.info('在线客服功能开发中')
      break
    case 'settings':
      router.push('/settings')
      break
  }
}

onMounted(async () => {
  // 记录页面访问（仅在客户端）
  if (process.client) {
    trackPageView({
      pagePath: '/profile',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      device: 'web'
    })
  }

  // 加载用户信息
  await loadUserInfo()
})
</script>

<style scoped>
.profile-page {
  background: #f5f5f5;
}

.top-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.top-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  pointer-events: none;
}

.top-section > div {
  position: relative;
  z-index: 1;
}

.coin-balance-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.menu-item:last-child {
  border-bottom: none;
}
</style>

