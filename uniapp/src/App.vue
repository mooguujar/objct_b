<template>
  <view id="app">
    <!-- uniapp 会自动根据 pages.json 渲染页面 -->
  </view>
</template>

<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';

onLaunch(() => {
  console.log('App Launch');
  // 检查登录状态
  const userStore = useUserStore();
  if (!userStore.isLogin) {
    // 未登录，跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login',
    });
  }
});

onShow(() => {
  console.log('App Show');
});
</script>

<style lang="scss">
@import './uni.scss';
</style>

