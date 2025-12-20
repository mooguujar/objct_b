<template>
  <view class="login-container">
    <view class="login-form">
      <text class="title">登录</text>
      <u-input
        v-model="form.username"
        placeholder="请输入用户名/手机号/邮箱"
        border="surround"
      />
      <u-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        border="surround"
      />
      <u-button type="primary" @click="handleLogin">登录</u-button>
      <view class="links">
        <text @click="goToRegister">注册账号</text>
        <text @click="goToForget">忘记密码</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const form = ref({
  username: '',
  password: '',
});

const handleLogin = async () => {
  try {
    await userStore.login(form.value.username, form.value.password);
    uni.switchTab({
      url: '/pages/index/index',
    });
  } catch (error) {
    console.error('Login failed:', error);
  }
};

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register',
  });
};

const goToForget = () => {
  uni.navigateTo({
    url: '/pages/forget/forget',
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  padding: 40px;
}

.login-form {
  .title {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 40px;
    display: block;
  }
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  color: #67FFD1;
}
</style>

