<template>
  <div class="base-card">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// 基础卡片组件
</script>

<style scoped>
.base-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

