import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  id: number | bigint
  username: string
  nickname: string
  avatar?: string | null
  role?: string
  coinBalance?: number
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const refreshToken = ref<string>('')

  // 初始化：从本地存储加载
  const init = () => {
    try {
      const savedUser = uni.getStorageSync('user')
      const savedToken = uni.getStorageSync('token')
      const savedRefreshToken = uni.getStorageSync('refreshToken')

      if (savedUser) {
        user.value = savedUser
      }
      if (savedToken) {
        token.value = savedToken
      }
      if (savedRefreshToken) {
        refreshToken.value = savedRefreshToken
      }
    } catch (error) {
      console.error('初始化用户状态失败:', error)
    }
  }

  // 设置用户信息
  const setUser = (userData: User) => {
    user.value = userData
    uni.setStorageSync('user', userData)
  }

  // 设置Token
  const setToken = (newToken: string, newRefreshToken: string) => {
    token.value = newToken
    refreshToken.value = newRefreshToken
    uni.setStorageSync('token', newToken)
    uni.setStorageSync('refreshToken', newRefreshToken)
  }

  // 清除用户信息
  const clearUser = () => {
    user.value = null
    token.value = ''
    refreshToken.value = ''
    uni.removeStorageSync('user')
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!token.value && !!user.value
  }

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      uni.setStorageSync('user', user.value)
    }
  }

  // 自动刷新Token
  const refreshUserToken = async () => {
    if (!refreshToken.value) {
      return false
    }

    try {
      const { authApi } = await import('@/api/auth')
      const result = await authApi.refresh(refreshToken.value)
      
      setToken(result.token, result.refreshToken)
      return true
    } catch (error) {
      console.error('刷新Token失败:', error)
      clearUser()
      return false
    }
  }

  // 初始化
  init()

  return {
    user,
    token,
    refreshToken,
    setUser,
    setToken,
    clearUser,
    isLoggedIn,
    updateUser,
    refreshUserToken,
  }
})

