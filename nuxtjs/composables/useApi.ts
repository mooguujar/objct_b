import { useUserStore } from '~/store/user'

export const useApi = () => {
  const config = useRuntimeConfig()

  const apiCall = async <T>(
    url: string,
    options: RequestInit & { body?: any } = {}
  ): Promise<T> => {
    // 获取Token（仅在客户端）
    let token = ''
    if (process.client) {
      const userStore = useUserStore()
      token = userStore.token
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Platform': 'web',
      ...(options.headers as HeadersInit),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await $fetch<{
        code: number
        message: string
        data: T
      }>(url, {
        baseURL: config.public.apiBase,
        method: options.method || 'GET',
        headers,
        body: options.body,
      })

      if (response.code === 200) {
        return response.data
      }

      if (response.code === 401) {
        // Token过期，清除用户信息并跳转到登录页
        if (process.client) {
          const userStore = useUserStore()
          userStore.clearUser()
          await navigateTo('/login')
        }
        throw new Error('未登录')
      }

      throw new Error(response.message || '请求失败')
    } catch (error: any) {
      // 处理网络错误或其他错误
      if (error.response?.status === 401) {
        if (process.client) {
          const userStore = useUserStore()
          userStore.clearUser()
          await navigateTo('/login')
        }
        throw new Error('未登录')
      }
      throw error
    }
  }

  return {
    get: <T>(url: string, options?: RequestInit) =>
      apiCall<T>(url, { ...options, method: 'GET' }),
    post: <T>(url: string, body?: any, options?: RequestInit) =>
      apiCall<T>(url, { ...options, method: 'POST', body }),
    put: <T>(url: string, body?: any, options?: RequestInit) =>
      apiCall<T>(url, { ...options, method: 'PUT', body }),
    patch: <T>(url: string, body?: any, options?: RequestInit) =>
      apiCall<T>(url, { ...options, method: 'PATCH', body }),
    delete: <T>(url: string, options?: RequestInit) =>
      apiCall<T>(url, { ...options, method: 'DELETE' }),
  }
}

