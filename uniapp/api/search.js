import request from '@/utils/request'

export const searchApi = {
  // 搜索内容
  searchPosts(keyword, params) {
    return request.get('/search/posts', { params: { keyword, ...params } })
  },

  // 搜索用户
  searchUsers(keyword, params) {
    return request.get('/search/users', { params: { keyword, ...params } })
  },

  // 搜索岛屿
  searchIslands(keyword, params) {
    return request.get('/search/islands', { params: { keyword, ...params } })
  },
}

