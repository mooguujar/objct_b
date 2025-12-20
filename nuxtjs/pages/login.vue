<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">欢迎回来</h1>
      <p class="login-subtitle">登录您的账户</p>
    </div>

    <el-card class="login-card">
      <el-form
        ref="loginFormRef"
        :model="form"
        :rules="rules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名/手机号/邮箱"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <div class="login-options">
          <el-link type="primary" :underline="false" @click="handleForgotPassword">
            忘记密码？
          </el-link>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="register-link">
          <span>还没有账户？</span>
          <el-link type="primary" @click="handleRegister">立即注册</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
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

const loginFormRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()

    loading.value = true

    const result = await api.post('/auth/login', {
      username: form.username,
      password: form.password,
    })

    // 保存用户信息和Token
    userStore.setUser(result.user)
    userStore.setToken(result.token, result.refreshToken)

    // 跳转到首页
    await router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  router.push('/register')
}

const handleForgotPassword = () => {
  // TODO: 跳转到忘记密码页面
  ElMessage.info('忘记密码功能开发中')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .login-title {
    font-size: 36px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10px;
  }

  .login-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-options {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;

  .el-link {
    margin-left: 5px;
  }
}
</style>

