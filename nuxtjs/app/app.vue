<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// 初始化时恢复认证状态
onMounted(() => {
  authStore.initAuth()
})
</script>
