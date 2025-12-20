<template>
  <view class="notification-item" :class="{ unread: !notification.isRead }" @click="$emit('click')">
    <view class="notification-icon">
      <u-icon
        :name="getIconName(notification.type)"
        :size="80"
        :color="getIconColor(notification.type)"
      />
    </view>
    <view class="notification-content">
      <text class="notification-title">{{ notification.title }}</text>
      <text class="notification-text" v-if="notification.content">{{ notification.content }}</text>
      <text class="notification-time">{{ formatTime(notification.createdAt) }}</text>
    </view>
    <view class="notification-dot" v-if="!notification.isRead"></view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  notification: any
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

const getIconName = (type: string) => {
  const iconMap: Record<string, string> = {
    system: 'info-circle',
    interaction: 'bell',
    payment: 'wallet',
  }
  return iconMap[type] || 'bell'
}

const getIconColor = (type: string) => {
  const colorMap: Record<string, string> = {
    system: '#409eff',
    interaction: '#67c23a',
    payment: '#e6a23c',
  }
  return colorMap[type] || '#909399'
}

const formatTime = (time: string) => {
  // TODO: 格式化时间
  return time
}
</script>

<style lang="scss" scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1rpx solid $u-border-color;
  position: relative;

  &.unread {
    background: #f8f9fa;
  }
}

.notification-icon {
  margin-right: 20rpx;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.notification-title {
  font-size: 28rpx;
  font-weight: bold;
  color: $u-main-color;
}

.notification-text {
  font-size: 26rpx;
  color: $u-content-color;
  line-height: 1.6;
}

.notification-time {
  font-size: 24rpx;
  color: $u-tips-color;
}

.notification-dot {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: $u-primary;
}
</style>

