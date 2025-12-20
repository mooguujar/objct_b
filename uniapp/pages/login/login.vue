<template>
  <view class="login-container">
    <view class="login-header">
      <text class="login-title">欢迎回来</text>
      <text class="login-subtitle">登录您的账户</text>
    </view>

    <view class="login-form">
      <u-form :model="form" ref="loginForm" :rules="rules">
        <u-form-item prop="username" label-width="0">
          <u-input
            v-model="form.username"
            placeholder="请输入用户名/手机号/邮箱"
            :clearable="true"
            prefix-icon="account"
          />
        </u-form-item>

        <u-form-item prop="password" label-width="0">
          <u-input
            v-model="form.password"
            placeholder="请输入密码"
            :clearable="true"
            :password="!showPassword"
            prefix-icon="lock"
          >
            <template #suffix>
              <u-icon
                :name="showPassword ? 'eye-fill' : 'eye-off'"
                @click="showPassword = !showPassword"
                color="#909399"
              />
            </template>
          </u-input>
        </u-form-item>

        <view class="login-options">
          <text class="forgot-password" @click="handleForgotPassword">
            忘记密码？
          </text>
        </view>

        <u-button
          type="primary"
          :loading="loading"
          :disabled="loading"
          @click="handleLogin"
          custom-style="margin-top: 40rpx;"
        >
          登录
        </u-button>

        <view class="register-link">
          <text>还没有账户？</text>
          <text class="link-text" @click="handleRegister">立即注册</text>
        </view>
      </u-form>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { authApi } from '@/api/auth'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const loginForm = ref()
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
    {
      min: 6,
      message: '密码至少6个字符',
      trigger: 'blur',
    },
  ],
}

const handleLogin = async () => {
  try {
    // 表单验证
    await loginForm.value.validate()

    loading.value = true

    // 调用登录接口
    const result = await authApi.login({
      username: form.username,
      password: form.password,
    })

    // 保存用户信息和Token
    userStore.setUser(result.user)
    userStore.setToken(result.token, result.refreshToken)

    // 显示成功提示
    uni.showToast({
      title: '登录成功',
      icon: 'success',
    })

    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index',
      })
    }, 1500)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register',
  })
}

const handleForgotPassword = () => {
  // TODO: 跳转到忘记密码页面
  uni.showToast({
    title: '忘记密码功能开发中',
    icon: 'none',
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100rpx 60rpx;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;

  .login-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
  }

  .login-subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.login-options {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
  margin-bottom: 20rpx;

  .forgot-password {
    font-size: 26rpx;
    color: $u-primary;
  }
}

.register-link {
  text-align: center;
  margin-top: 40rpx;
  font-size: 26rpx;
  color: $u-content-color;

  .link-text {
    color: $u-primary;
    margin-left: 10rpx;
  }
}
</style>
