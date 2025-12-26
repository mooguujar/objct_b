<template>
  <div class="notifications-page min-h-screen pb-20">
    <!-- 顶部导航栏（带渐变背景） -->
    <div class="top-header bg-gradient-to-r from-yellow-100 via-green-100 to-blue-100">
      <div class="flex items-center justify-between px-4 py-4">
        <h1 class="text-xl font-bold text-gray-900">通知</h1>
        <el-icon
          class="cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
          :size="20"
          @click="handleClearAll"
        >
          <Delete />
        </el-icon>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="px-4 py-4 space-y-4">
      <!-- 系统通知 -->
      <div class="notification-category bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <Bell />
            </el-icon>
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold text-gray-900">系统通知</h2>
            <p v-if="systemNotifications.length === 0" class="text-sm text-gray-500 mt-1">
              暂时没有系统通知
            </p>
          </div>
        </div>
        <div v-if="systemNotifications.length > 0" class="space-y-2">
          <div
            v-for="notification in systemNotifications"
            :key="notification.id"
            class="notification-item p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900 mb-1">{{ notification.title }}</h3>
                <p v-if="notification.content" class="text-xs text-gray-600 line-clamp-2">
                  {{ notification.content }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatTime(notification.createdAt) }}
                </p>
              </div>
              <div
                v-if="!notification.isRead"
                class="w-2 h-2 rounded-full bg-blue-500 ml-2 flex-shrink-0 mt-1"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 互动通知 -->
      <div class="notification-category bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <ChatDotRound />
            </el-icon>
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold text-gray-900">互动通知</h2>
            <p v-if="interactionNotifications.length === 0" class="text-sm text-gray-500 mt-1">
              暂时没有动态互动通知
            </p>
          </div>
        </div>
        <div v-if="interactionNotifications.length > 0" class="space-y-2">
          <div
            v-for="notification in interactionNotifications"
            :key="notification.id"
            class="notification-item p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900 mb-1">{{ notification.title }}</h3>
                <p v-if="notification.content" class="text-xs text-gray-600 line-clamp-2">
                  {{ notification.content }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatTime(notification.createdAt) }}
                </p>
              </div>
              <div
                v-if="!notification.isRead"
                class="w-2 h-2 rounded-full bg-blue-500 ml-2 flex-shrink-0 mt-1"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 付费通知 -->
      <div class="notification-category bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <el-icon :size="24" class="text-white">
              <Money />
            </el-icon>
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold text-gray-900">付费通知</h2>
            <p v-if="paymentNotifications.length === 0" class="text-sm text-gray-500 mt-1">
              暂时没有付费消息
            </p>
          </div>
        </div>
        <div v-if="paymentNotifications.length > 0" class="space-y-2">
          <div
            v-for="notification in paymentNotifications"
            :key="notification.id"
            class="notification-item p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900 mb-1">{{ notification.title }}</h3>
                <p v-if="notification.content" class="text-xs text-gray-600 line-clamp-2">
                  {{ notification.content }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatTime(notification.createdAt) }}
                </p>
              </div>
              <div
                v-if="!notification.isRead"
                class="w-2 h-2 rounded-full bg-blue-500 ml-2 flex-shrink-0 mt-1"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="py-4">
        <el-skeleton :rows="3" animated />
      </div>
    </div>

    <!-- 底部导航栏 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications, type Notification } from '../composables/useNotifications'
import { useStatistics } from '../composables/useStatistics'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, ChatDotRound, Money, Delete } from '@element-plus/icons-vue'
import BottomNav from '../components/BottomNav.vue'

// 使用认证中间件
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { getNotifications, markAsRead, clearAll } = useNotifications()
const { trackPageView, trackClick } = useStatistics()

const systemNotifications = ref<Notification[]>([])
const interactionNotifications = ref<Notification[]>([])
const paymentNotifications = ref<Notification[]>([])
const loading = ref(false)

// 加载通知数据
const loadNotifications = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const [systemRes, interactionRes, paymentRes] = await Promise.all([
      getNotifications('system', 1, 10),
      getNotifications('interaction', 1, 10),
      getNotifications('payment', 1, 10)
    ])

    systemNotifications.value = systemRes.list
    interactionNotifications.value = interactionRes.list
    paymentNotifications.value = paymentRes.list
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 点击通知
const handleNotificationClick = async (notification: Notification) => {
  trackClick({
    elementId: `notification-${notification.id}`,
    elementType: 'notification',
    pagePath: '/notifications',
    content: { notificationId: notification.id, type: notification.type }
  })

  // 如果未读，标记为已读
  if (!notification.isRead) {
    try {
      await markAsRead(notification.id)
      notification.isRead = true
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 根据通知类型跳转
  if (notification.relatedId && notification.relatedType) {
    if (notification.relatedType === 'post') {
      router.push(`/posts/${notification.relatedId}`)
    } else if (notification.relatedType === 'island') {
      router.push(`/islands/${notification.relatedId}`)
    }
  }
}

// 清除所有通知
const handleClearAll = async () => {
  trackClick({
    elementId: 'clear-all-notifications',
    elementType: 'button',
    pagePath: '/notifications',
    content: { action: 'clear-all' }
  })

  try {
    await ElMessageBox.confirm('确定要清除所有通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await clearAll()
    ElMessage.success('清除成功')
    await loadNotifications()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '清除失败')
    }
  }
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

onMounted(async () => {
  // 记录页面访问（仅在客户端）
  if (process.client) {
    trackPageView({
      pagePath: '/notifications',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      device: 'web'
    })
  }

  // 加载通知数据
  await loadNotifications()
})
</script>

<style scoped>
.notifications-page {
  background: linear-gradient(to bottom, #fef9e7 0%, #e8f5e9 50%, #e3f2fd 100%);
}

.top-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

