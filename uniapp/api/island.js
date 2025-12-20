import request from '@/utils/request'

export const islandApi = {
  // 获取热门岛屿
  getHotIslands(params) {
    return request.get('/islands/hot', { params })
  },
  
  // 获取我的岛屿
  getMyIslands(params) {
    return request.get('/islands/my', { params })
  },
  
  // 获取岛屿详情
  getIslandById(id) {
    return request.get(`/islands/${id}`)
  },
  
  // 获取岛屿内容列表
  getIslandPosts(id, params) {
    return request.get(`/islands/${id}/posts`, { params })
  },
}

