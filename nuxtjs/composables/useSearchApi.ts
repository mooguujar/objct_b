import { useApi } from './useApi'

export const useSearchApi = () => {
  const api = useApi()

  return {
    // 搜索内容
    searchPosts: (keyword: string, params?: { page?: number; pageSize?: number }) =>
      api.get('/search/posts', { params: { keyword, ...params } }),

    // 搜索用户
    searchUsers: (keyword: string, params?: { page?: number; pageSize?: number }) =>
      api.get('/search/users', { params: { keyword, ...params } }),

    // 搜索岛屿
    searchIslands: (keyword: string, params?: { page?: number; pageSize?: number }) =>
      api.get('/search/islands', { params: { keyword, ...params } }),
  }
}

