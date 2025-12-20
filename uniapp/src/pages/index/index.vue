<template>
  <view class="container">
    <text class="title">岛屿社交平台</text>
    <view v-if="!isLogin" class="login-tip">
      <text>请先登录</text>
      <button @click="goToLogin" class="login-btn">去登录</button>
    </view>
    <view v-else class="user-info">
      <text>欢迎，{{ userInfo?.nickname || userInfo?.username }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const isLogin = computed(() => userStore.isLogin);
const userInfo = computed(() => userStore.userInfo);

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login',
  });
};

// 页面加载时检查登录状态
onLoad(() => {
  if (!userStore.isLogin) {
    uni.reLaunch({
      url: '/pages/login/login',
    });
  }
});
</script>

<style lang="scss" scoped>
.container {
  padding: 40px;
  text-align: center;
}

.title {
  font-size: 32px;
  color: #67FFD1;
  margin-bottom: 20px;
  display: block;
}

.login-tip {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.login-btn {
  padding: 12px 24px;
  background-color: #67FFD1;
  color: #fff;
  border: none;
  border-radius: 4px;
}

.user-info {
  margin-top: 20px;
  font-size: 16px;
  color: #333;
}
</style>

