<template>
  <div class="home-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>欢迎</span>
          <el-button v-if="!authStore.isAuthenticated" type="primary" @click="goToLogin">
            登录
          </el-button>
          <div v-else class="user-info">
            <span>欢迎, {{ authStore.user?.username }}</span>
            <el-button type="danger" size="small" @click="handleLogout">
              退出
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="content">
        <h1>岛屿社交平台</h1>
        <p>这是一个基于 Nuxt.js 3 构建的社交平台项目</p>
        
        <div v-if="authStore.isAuthenticated" class="user-card">
          <el-descriptions title="用户信息" :column="1" border>
            <el-descriptions-item label="用户名">
              {{ authStore.user?.username }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ authStore.user?.email || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ authStore.user?.phone || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              {{ authStore.user?.role }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useAuth } from '../composables/useAuth'
import { useStatistics } from '../composables/useStatistics'
import { ElMessage } from 'element-plus'

// 使用认证中间件，未登录自动跳转到登录页
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { logout, fetchUserInfo } = useAuth()
const { trackPageView, trackClick } = useStatistics()
const router = useRouter()

onMounted(async () => {
  // 初始化认证状态（中间件已经检查过了，这里只是同步状态）
  authStore.initAuth()
  
  // 双重检查：如果 store 中没有 token，说明 localStorage 也没有，应该已经被中间件拦截
  if (!authStore.token || !authStore.user) {
    console.log('Index page: No auth found, redirecting to login')
    authStore.clearAuth()
    await router.push('/login')
    return
  }
  
  // 验证 token 是否有效（调用 API 验证）
  try {
    const result = await fetchUserInfo()
    // 如果验证失败（token 无效或过期），清除认证信息并跳转到登录页
    if (!result.success) {
      console.log('Index page: Token validation failed, redirecting to login')
      authStore.clearAuth()
      await router.push('/login')
      return
    }
    
    // 验证成功，记录页面访问统计
    trackPageView({
      pagePath: '/',
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      device: 'web'
    })
  } catch (error) {
    console.error('Index page: Error validating token:', error)
    authStore.clearAuth()
    await router.push('/login')
  }
})

const goToLogin = () => {
  trackClick({
    elementId: 'login-button',
    elementType: 'button',
    pagePath: '/',
    content: { action: 'navigate-to-login' }
  })
  router.push('/login')
}

const handleLogout = () => {
  trackClick({
    elementId: 'logout-button',
    elementType: 'button',
    pagePath: '/',
    content: { action: 'logout' }
  })
  logout()
  ElMessage.success('已退出登录')
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.content {
  text-align: center;
  padding: 40px 0;
}

.content h1 {
  margin-bottom: 20px;
  color: #303133;
}

.content p {
  color: #606266;
  margin-bottom: 40px;
}

.user-card {
  margin-top: 40px;
  text-align: left;
}
</style>

