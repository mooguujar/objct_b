<template>
  <view v-if="visible" class="publish-modal" @click="handleMaskClick">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">发布</text>
        <u-icon name="close" size="40" color="#909399" @click="handleClose" />
      </view>
      
      <view class="publish-options">
        <view class="option-item" @click="handlePersonalPost">
          <view class="option-icon option-icon-windmill">
            <u-icon name="setting" size="72" color="#ec4899" />
          </view>
          <text class="option-text">发布个人动态</text>
        </view>
        
        <view class="option-item" @click="handleIslandPost">
          <view class="option-icon option-icon-note">
            <u-icon name="file-text" size="72" color="#f59e0b" />
          </view>
          <text class="option-text">发布岛屿帖子</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible', 'personal', 'island'])

const handleClose = () => {
  emit('update:visible', false)
}

const handleMaskClick = () => {
  emit('update:visible', false)
}

const handlePersonalPost = () => {
  emit('personal')
  emit('update:visible', false)
}

const handleIslandPost = () => {
  emit('island')
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.publish-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background-color: #fff;
  border-radius: 32rpx;
  width: 640rpx;
  padding: 32rpx;
  position: relative;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
  position: relative;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.modal-header :deep(.u-icon) {
  position: absolute;
  left: 0;
  cursor: pointer;
}

.publish-options {
  display: flex;
  justify-content: center;
  gap: 112rpx;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  cursor: pointer;
}

.option-icon {
  width: 144rpx;
  height: 144rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-icon-windmill {
  // 彩色风车图标样式
  background: linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #fef3c7 100%);
  border-radius: 24rpx;
}

.option-icon-note {
  // 黄色便签图标样式
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border-radius: 24rpx;
}

.option-text {
  font-size: 28rpx;
  color: #666;
}
</style>

