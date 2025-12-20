import { useApi } from './useApi'
import { useUserStore } from '~/store/user'

export const useUploadApi = () => {
  const config = useRuntimeConfig()

  const uploadFile = async (
    file: File,
    endpoint: 'image' | 'video' | 'file',
  ): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    // 获取Token（仅在客户端）
    let token = ''
    if (process.client) {
      const userStore = useUserStore()
      token = userStore.token
    }

    const headers: HeadersInit = {
      'X-Platform': 'web',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await $fetch<{
      code: number
      message: string
      data: { url: string }
    }>(`/upload/${endpoint}`, {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers,
      body: formData,
    })

    if (response.code === 200) {
      return response.data.url
    }

    throw new Error(response.message || '上传失败')
  }

  return {
    uploadImage: (file: File) => uploadFile(file, 'image'),
    uploadVideo: (file: File) => uploadFile(file, 'video'),
    uploadFile: (file: File) => uploadFile(file, 'file'),
  }
}

