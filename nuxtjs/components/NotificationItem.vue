<template>
  <div
    class="notification-item"
    :class="{ unread: !notification.isRead }"
    @click="$emit('click')"
  >
    <div class="notification-icon">
      <el-icon :size="40" :color="getIconColor(notification.type)">
        <Bell v-if="notification.type === 'system'" />
        <ChatDotRound v-else-if="notification.type === 'interaction'" />
        <Wallet v-else />
      </el-icon>
    </div>
    <div class="notification-content">
      <h3 class="notification-title">{{ notification.title }}</h3>
      <p v-if="notification.content" class="notification-text">
        {{ notification.content }}
      </p>
      <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
    </div>
    <div v-if="!notification.isRead" class="notification-dot"></div>
  </div>
</template>

<script setup lang="ts">
import { Bell, ChatDotRound, Wallet } from '@element-plus/icons-vue'

interface Props {
  notification: any
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

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

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 20px 30px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f5f7fa;
}

.notification-item.unread {
  background: #f8f9fa;
}

.notification-icon {
  margin-right: 15px;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.notification-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-dot {
  position: absolute;
  top: 20px;
  right: 30px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3cc51f;
}
</style>

