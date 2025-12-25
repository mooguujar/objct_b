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

export interface IslandListResponse {
  list: Island[]
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

  return {
    getPopularIslands
  }
}

