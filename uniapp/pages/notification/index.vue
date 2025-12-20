<template>
  <view class="notification-page">
    <view class="page-header">
      <text class="page-title">通知</text>
      <view class="clear-btn" @click="handleClear">
        <text>清除全部</text>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-section">
      <view
        v-for="category in categories"
        :key="category.key"
        class="category-tag"
        :class="{ active: currentCategory === category.key }"
        @click="selectCategory(category.key)"
      >
        {{ category.label }}
      </view>
    </view>

    <!-- 通知列表 -->
    <view class="notification-list">
      <NotificationItem
        v-for="notification in notificationList"
        :key="notification.id"
        :notification="notification"
        @click="handleNotificationClick(notification)"
      />
    </view>

    <!-- 空状态 -->
    <view v-if="notificationList.length === 0 && !loading" class="empty-state">
      <u-empty mode="data" text="暂无通知" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NotificationItem from '@/components/NotificationItem.vue'

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
    // TODO: 调用接口
    // const result = await notificationApi.getNotifications({ type: currentCategory.value })
    // notificationList.value = result.list
  } catch (error: any) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const handleClear = () => {
  // TODO: 清除通知
  uni.showToast({
    title: '清除功能开发中',
    icon: 'none',
  })
}

const handleNotificationClick = (notification: any) => {
  // TODO: 跳转到详情
}

onMounted(() => {
  loadNotifications()
})
</script>

<style lang="scss" scoped>
.notification-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: #fff;

  .page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: $u-main-color;
  }

  .clear-btn {
    font-size: 28rpx;
    color: $u-primary;
  }
}

.category-section {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid $u-border-color;
}

.category-tag {
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  background: #f5f5f5;
  color: $u-content-color;
  font-size: 26rpx;

  &.active {
    background: $u-primary;
    color: #fff;
  }
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 100rpx 0;
}
</style>

