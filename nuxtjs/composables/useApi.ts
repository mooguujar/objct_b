export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const request = async <T = any>(
    url: string,
    options: { method?: string; body?: any; headers?: HeadersInit } = {}
  ): Promise<{ code: number; message: string; data: T }> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // 添加token
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    const fetchOptions: any = {
      method: options.method || 'GET',
      headers
    }

    if (options.body) {
      fetchOptions.body = options.body
    }

    const response = await $fetch<{ code: number; message: string; data: T }>(
      `${config.public.apiBase}${url}`,
      fetchOptions
    )

    return response
  }

  return {
    request
  }
}

