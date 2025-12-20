import request from '@/utils/request'

export const creatorApi = {
  // 申请入驻
  apply(data) {
    return request.post('/creator/apply', data)
  },
  
  // 查询申请状态
  getStatus() {
    return request.get('/creator/status')
  },
}

