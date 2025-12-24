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
      // 在客户端检查，服务端总是返回 false
      if (process.server) {
        return false
      }
      // 同时检查 localStorage，确保数据一致
      if (process.client) {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        return !!(state.token && state.user && token && userStr)
      }
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

