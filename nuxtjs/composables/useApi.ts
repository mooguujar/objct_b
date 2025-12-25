export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const request = async <T = any>(
    url: string,
    options: { method?: string; body?: any; query?: any; headers?: HeadersInit } = {}
  ): Promise<{ code: number; message: string; data: T }> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // 添加token（从 store 或 localStorage 获取）
    const token = authStore.token || (process.client ? localStorage.getItem('token') : null)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const fetchOptions: any = {
      method: options.method || 'GET',
      headers
    }

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body)
    }

    // 处理 query 参数
    let finalUrl = `${config.public.apiBase}${url}`
    if (options.query && Object.keys(options.query).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(options.query).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString()
      if (queryString) {
        finalUrl += `?${queryString}`
      }
    }

    try {
      const response = await $fetch<{ code: number; message: string; data: T }>(
        finalUrl,
        fetchOptions
      )
      return response
    } catch (error: any) {
      // 如果是 401 未授权错误，清除认证信息
      if (error.statusCode === 401 || error.status === 401) {
        if (process.client) {
          authStore.clearAuth()
        }
      }
      throw error
    }
  }

  return {
    request
  }
}

