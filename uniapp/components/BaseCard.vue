<template>
  <view class="base-card">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
// 基础卡片组件
</script>

<style lang="scss" scoped>
.base-card {
  background: #fff;
  border-radius: $u-border-radius-base;
  padding: $u-spacing-base;
  margin-bottom: $u-spacing-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}
</style>

