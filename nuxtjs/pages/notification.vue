<template>
  <div class="notification-page">
    <div class="page-header">
      <h1 class="page-title">通知</h1>
      <el-button type="primary" link @click="handleClear">清除全部</el-button>
    </div>

    <!-- 分类标签 -->
    <div class="category-section">
      <el-tag
        v-for="category in categories"
        :key="category.key"
        :type="currentCategory === category.key ? 'primary' : 'info'"
        class="category-tag"
        @click="selectCategory(category.key)"
      >
        {{ category.label }}
      </el-tag>
    </div>

    <!-- 通知列表 -->
    <div class="notification-list">
      <NotificationItem
        v-for="notification in notificationList"
        :key="notification.id"
        :notification="notification"
        @click="handleNotificationClick(notification)"
      />
    </div>

    <el-empty v-if="notificationList.length === 0 && !loading" description="暂无通知" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: 'auth',
})

const api = useApi()

const currentCategory = ref('')
const notificationList = ref<any[]>([])
const loading = ref(false)

const categories = [
  { key: '', label: '全部' },
  { key: 'system', label: '系统' },
  { key: 'interaction', label: '互动' },
  { key: 'payment', label: '付费' },
]

const selectCategory = (key: string) => {
  currentCategory.value = key
  loadNotifications()
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const result = await api.get('/notifications', {
      params: {
        type: currentCategory.value || undefined,
      },
    })
    notificationList.value = result.list || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleClear = () => {
  ElMessage.info('清除功能开发中')
}

const handleNotificationClick = (notification: any) => {
  // TODO: 跳转到详情
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background: #fff;
}

.category-section {
  display: flex;
  gap: 10px;
  padding: 15px 30px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.category-tag {
  cursor: pointer;
}

.notification-list {
  display: flex;
  flex-direction: column;
}
</style>

