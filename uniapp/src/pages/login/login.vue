<template>
  <view class="login-container">
    <view class="login-form">
      <text class="title">登录</text>
      <input
        v-model="form.username"
        placeholder="请输入用户名/手机号/邮箱"
        class="input"
      />
      <input
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        class="input"
      />
      <button type="primary" @click="handleLogin" class="btn">登录</button>
      <view class="links">
        <text @click="goToRegister">注册账号</text>
        <text @click="goToForget">忘记密码</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const form = ref({
  username: '',
  password: '',
});

const handleLogin = async () => {
  try {
    await userStore.login(form.value.username, form.value.password);
    uni.reLaunch({
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
  
  .input {
    width: 100%;
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .btn {
    width: 100%;
    padding: 12px;
    background-color: #67FFD1;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 16px;
  }
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  color: #67FFD1;
}
</style>

