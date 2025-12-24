import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  const { request } = useApi()
  const router = useRouter()

  const login = async (username: string, password: string) => {
    try {
      const response = await request('/auth/login', {
        method: 'POST',
        body: {
          username,
          password
        }
      })
      
      if (response.code === 200 && response.data) {
        authStore.setAuth(response.data.user, response.data.token)
        return { success: true, message: response.message }
      }
      return { success: false, message: response.message }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.data?.message || '登录失败，请稍后重试' 
      }
    }
  }

  const register = async (data: {
    username: string
    password: string
    email?: string
    phone?: string
  }) => {
    try {
      const response = await request('/auth/register', {
        method: 'POST',
        body: data
      })
      
      if (response.code === 200 && response.data) {
        authStore.setAuth(response.data.user, response.data.token)
        return { success: true, message: response.message }
      }
      return { success: false, message: response.message }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.data?.message || '注册失败，请稍后重试' 
      }
    }
  }

  const logout = () => {
    authStore.clearAuth()
    router.push('/login')
  }

  const fetchUserInfo = async () => {
    try {
      const response = await request('/auth/me')
      if (response.code === 200 && response.data) {
        authStore.user = response.data
        return { success: true, user: response.data }
      }
      return { success: false }
    } catch (error) {
      authStore.clearAuth()
      return { success: false }
    }
  }

  return {
    login,
    register,
    logout,
    fetchUserInfo
  }
}

