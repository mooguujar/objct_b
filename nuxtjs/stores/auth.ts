import { defineStore } from 'pinia'

export interface User {
  id: number | bigint
  username: string
  email?: string | null
  phone?: string | null
  avatar?: string | null
  nickname?: string | null
  bio?: string | null
  role: string
  status: string
  created_at: string
  updated_at: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => {
      // 服务端总是返回 false，避免水合不匹配
      if (process.server) {
        return false
      }
      // 客户端检查：优先使用 state，同时验证 localStorage
      if (process.client && typeof window !== 'undefined') {
        try {
          const token = localStorage.getItem('token')
          const userStr = localStorage.getItem('user')
          // 如果 state 和 localStorage 都有数据，返回 true
          return !!(state.token && state.user && token && userStr)
        } catch {
          // localStorage 访问失败时，仅使用 state
          return !!state.token && !!state.user
        }
      }
      // 非客户端环境，仅使用 state
      return !!state.token && !!state.user
    },
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      // 存储到localStorage
      if (process.client) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    initAuth() {
      if (process.client) {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        if (token && userStr) {
          this.token = token
          this.user = JSON.parse(userStr)
        }
      }
    }
  }
})

