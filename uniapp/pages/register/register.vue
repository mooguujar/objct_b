<template>
  <view class="register-container">
    <view class="register-header">
      <text class="register-title">创建账户</text>
      <text class="register-subtitle">加入岛屿社交平台</text>
    </view>

    <view class="register-form">
      <u-form :model="form" ref="registerForm" :rules="rules">
        <u-form-item prop="username" label-width="0">
          <u-input
            v-model="form.username"
            placeholder="请输入用户名（3-50字符）"
            :clearable="true"
            prefix-icon="account"
          />
        </u-form-item>

        <u-form-item prop="nickname" label-width="0">
          <u-input
            v-model="form.nickname"
            placeholder="请输入昵称"
            :clearable="true"
            prefix-icon="account"
          />
        </u-form-item>

        <u-form-item prop="password" label-width="0">
          <u-input
            v-model="form.password"
            placeholder="请输入密码（6-20字符）"
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

        <u-form-item prop="confirmPassword" label-width="0">
          <u-input
            v-model="form.confirmPassword"
            placeholder="请再次输入密码"
            :clearable="true"
            :password="!showConfirmPassword"
            prefix-icon="lock"
          >
            <template #suffix>
              <u-icon
                :name="showConfirmPassword ? 'eye-fill' : 'eye-off'"
                @click="showConfirmPassword = !showConfirmPassword"
                color="#909399"
              />
            </template>
          </u-input>
        </u-form-item>

        <u-form-item prop="phone" label-width="0">
          <u-input
            v-model="form.phone"
            placeholder="请输入手机号（可选）"
            :clearable="true"
            type="number"
            prefix-icon="phone"
          />
        </u-form-item>

        <u-form-item prop="email" label-width="0">
          <u-input
            v-model="form.email"
            placeholder="请输入邮箱（可选）"
            :clearable="true"
            prefix-icon="email"
          />
        </u-form-item>

        <u-button
          type="primary"
          :loading="loading"
          :disabled="loading"
          @click="handleRegister"
          custom-style="margin-top: 40rpx;"
        >
          注册
        </u-button>

        <view class="login-link">
          <text>已有账户？</text>
          <text class="link-text" @click="handleLogin">立即登录</text>
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

const registerForm = ref()
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 50,
      message: '用户名长度为3-50个字符',
      trigger: 'blur',
    },
  ],
  nickname: [
    {
      required: true,
      message: '请输入昵称',
      trigger: 'blur',
    },
    {
      min: 1,
      max: 50,
      message: '昵称长度为1-50个字符',
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
      max: 20,
      message: '密码长度为6-20个字符',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: 'blur',
    },
    {
      validator: validateConfirmPassword,
      trigger: 'blur',
    },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式不正确',
      trigger: 'blur',
    },
  ],
  email: [
    {
      type: 'email',
      message: '邮箱格式不正确',
      trigger: 'blur',
    },
  ],
}

const handleRegister = async () => {
  try {
    // 表单验证
    await registerForm.value.validate()

    loading.value = true

    // 调用注册接口
    const result = await authApi.register({
      username: form.username,
      nickname: form.nickname,
      password: form.password,
      phone: form.phone || undefined,
      email: form.email || undefined,
    })

    // 保存用户信息和Token
    userStore.setUser(result.user)
    userStore.setToken(result.token, result.refreshToken)

    // 显示成功提示
    uni.showToast({
      title: '注册成功',
      icon: 'success',
    })

    // 自动登录，跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index',
      })
    }, 1500)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '注册失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const handleLogin = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100rpx 60rpx;
}

.register-header {
  text-align: center;
  margin-bottom: 80rpx;

  .register-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
  }

  .register-subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.register-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.login-link {
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
