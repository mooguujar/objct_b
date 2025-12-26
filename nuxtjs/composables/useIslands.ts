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

export interface IslandDetail extends Island {
  status: string
  isMember: boolean
  joinType: 'free' | 'paid' | null
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

export interface IslandPostsResponse {
  list: any[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  isMember: boolean
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

  // 获取岛屿详情
  const getIslandDetail = async (islandId: number): Promise<IslandDetail> => {
    console.log('getIslandDetail called with islandId:', islandId)
    const response = await request<IslandDetail>(`/islands/${islandId}`, {
      method: 'GET'
    })
    console.log('getIslandDetail response:', response)
    return response.data
  }

  // 获取岛屿帖子列表
  const getIslandPosts = async (islandId: number, page = 1, pageSize = 20): Promise<IslandPostsResponse> => {
    const response = await request<IslandPostsResponse>(`/islands/${islandId}/posts`, {
      method: 'GET',
      query: { page, pageSize }
    })
    return response.data
  }

  // 获取我的岛屿列表
  const getMyIslands = async (page = 1, pageSize = 20): Promise<IslandListResponse> => {
    const response = await request<IslandListResponse>('/islands/my', {
      method: 'GET',
      query: { page, pageSize }
    })
    return response.data
  }

  // 获取我加入的岛屿列表
  const getJoinedIslands = async (page = 1, pageSize = 20): Promise<IslandListResponse> => {
    const response = await request<IslandListResponse>('/islands/joined', {
      method: 'GET',
      query: { page, pageSize }
    })
    return response.data
  }

  // 加入岛屿
  const joinIsland = async (islandId: number): Promise<{ islandId: number; joinType: string; paidAmount: number }> => {
    const response = await request<{ islandId: number; joinType: string; paidAmount: number }>(`/islands/${islandId}/join`, {
      method: 'POST'
    })
    return response.data
  }

  return {
    getPopularIslands,
    getRecommendedIslands,
    getIslandsByCategory,
    getIslandDetail,
    getIslandPosts,
    getMyIslands,
    getJoinedIslands,
    joinIsland
  }
}
