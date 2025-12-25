export interface Post {
  id: number
  userId: number
  islandId: number | null
  title: string | null
  content: string | null
  mediaType: 'text' | 'image' | 'video' | 'mixed'
  mediaUrls: string[] | null
  likeCount: number
  commentCount: number
  collectCount: number
  viewCount: number
  shareCount: number
  isTop: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: number
    username: string
    nickname: string
    avatar: string | null
    isVerified?: boolean
  }
  island: {
    id: number
    name: string
    avatar: string | null
  } | null
  isLiked: boolean
  isCollected?: boolean
}

export interface Comment {
  id: number
  postId: number
  userId: number
  content: string
  parentId: number | null
  likeCount: number
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: number
    username: string
    nickname: string
    avatar: string | null
    isVerified: boolean
  }
  isLiked: boolean
  replies?: Comment[]
}

export interface CommentListResponse {
  list: Comment[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface PostListResponse {
  list: Post[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const usePosts = () => {
  const { request } = useApi()

  // 获取发现页帖子列表
  const getDiscoverPosts = async (page = 1, pageSize = 20): Promise<PostListResponse> => {
    const response = await request<PostListResponse>('/posts/discover', {
      method: 'GET',
      query: { page, pageSize }
    })
    return response.data
  }

  // 获取关注页帖子列表
  const getFollowingPosts = async (page = 1, pageSize = 20): Promise<PostListResponse> => {
    const response = await request<PostListResponse>('/posts/following', {
      method: 'GET',
      query: { page, pageSize }
    })
    return response.data
  }

  // 获取帖子详情
  const getPostDetail = async (postId: number): Promise<Post> => {
    const response = await request<Post>(`/posts/${postId}`, {
      method: 'GET'
    })
    return response.data
  }

  // 获取帖子评论列表
  const getPostComments = async (postId: number, page = 1, pageSize = 20): Promise<CommentListResponse> => {
    const response = await request<CommentListResponse>(`/posts/${postId}/comments`, {
      method: 'GET',
      query: { page, pageSize }
    })
    return response.data
  }

  // 点赞/取消点赞
  const toggleLike = async (postId: number): Promise<{ isLiked: boolean; likeCount: number }> => {
    const response = await request<{ isLiked: boolean; likeCount: number }>(`/posts/${postId}/like`, {
      method: 'POST'
    })
    return response.data
  }

  return {
    getDiscoverPosts,
    getFollowingPosts,
    getPostDetail,
    getPostComments,
    toggleLike
  }
}
