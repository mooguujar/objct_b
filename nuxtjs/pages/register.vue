<template>
  <div class="register-container">
    <div class="register-header">
      <h1 class="register-title">创建账户</h1>
      <p class="register-subtitle">加入岛屿社交平台</p>
    </div>

    <el-card class="register-card">
      <el-form
        ref="registerFormRef"
        :model="form"
        :rules="rules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名（3-50字符）"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="请输入昵称"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（6-20字符）"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号（可选）"
            :prefix-icon="Phone"
            clearable
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱（可选）"
            :prefix-icon="Message"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="loading"
            class="register-button"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="login-link">
          <span>已有账户？</span>
          <el-link type="primary" @click="handleLogin">立即登录</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock, Phone, Message } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/store/user'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const router = useRouter()
const userStore = useUserStore()
const api = useApi()

const registerFormRef = ref()
const loading = ref(false)

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
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为3-50个字符', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 50, message: '昵称长度为1-50个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式不正确',
      trigger: 'blur',
    },
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()

    loading.value = true

    const result = await api.post('/auth/register', {
      username: form.username,
      nickname: form.nickname,
      password: form.password,
      phone: form.phone || undefined,
      email: form.email || undefined,
    })

    // 保存用户信息和Token
    userStore.setUser(result.user)
    userStore.setToken(result.token, result.refreshToken)

    // 跳转到首页
    await router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const handleLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;

  .register-title {
    font-size: 36px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10px;
  }

  .register-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.register-card {
  width: 100%;
  max-width: 450px;
}

.register-button {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;

  .el-link {
    margin-left: 5px;
  }
}
</style>

