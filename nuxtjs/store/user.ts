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

  // 初始化：从本地存储加载（仅客户端）
  const init = () => {
    if (process.client) {
      try {
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('token')
        const savedRefreshToken = localStorage.getItem('refreshToken')

        if (savedUser) {
          user.value = JSON.parse(savedUser)
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
  }

  // 设置用户信息
  const setUser = (userData: User) => {
    user.value = userData
    if (process.client) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  // 设置Token
  const setToken = (newToken: string, newRefreshToken: string) => {
    token.value = newToken
    refreshToken.value = newRefreshToken
    if (process.client) {
      localStorage.setItem('token', newToken)
      localStorage.setItem('refreshToken', newRefreshToken)
    }
  }

  // 清除用户信息
  const clearUser = () => {
    user.value = null
    token.value = ''
    refreshToken.value = ''
    if (process.client) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!token.value && !!user.value
  }

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      if (process.client) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    }
  }

  // 初始化
  if (process.client) {
    init()
  }

  return {
    user,
    token,
    refreshToken,
    setUser,
    setToken,
    clearUser,
    isLoggedIn,
    updateUser,
  }
})

