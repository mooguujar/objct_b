export interface Island {
  id: number
  name: string
  description: string | null
  cover: string | null
  avatar: string | null
  category: string
  ownerId: number
  price: number
  memberCount: number
  postCount: number
  isVerified: boolean
  createdAt: string
  updatedAt: string
  owner: {
    id: number
    username: string
    nickname: string
    avatar: string | null
  }
}

export interface IslandWithPreview extends Island {
  previewPosts: Array<{
    id: number
    mediaUrls: string[] | null
    mediaType: string
  }>
}

export interface IslandListResponse {
  list: Island[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface IslandListWithPreviewResponse {
  list: IslandWithPreview[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const useIslands = () => {
  const { request } = useApi()

  // 获取热门岛屿列表
  const getPopularIslands = async (page = 1, pageSize = 20): Promise<IslandListResponse> => {
    const response = await request<IslandListResponse>('/islands/popular', {
      method: 'GET',
      query: { page, pageSize }
    })
    return response.data
  }

  // 获取推荐岛屿列表
  const getRecommendedIslands = async (limit = 10): Promise<{ list: Island[] }> => {
    const response = await request<{ list: Island[] }>('/islands/recommended', {
      method: 'GET',
      query: { limit }
    })
    return response.data
  }

  // 按分类获取岛屿列表
  const getIslandsByCategory = async (category: string, page = 1, pageSize = 20): Promise<IslandListWithPreviewResponse> => {
    const response = await request<IslandListWithPreviewResponse>('/islands/category', {
      method: 'GET',
      query: { category, page, pageSize }
    })
    return response.data
  }

  return {
    getPopularIslands,
    getRecommendedIslands,
    getIslandsByCategory
  }
}
