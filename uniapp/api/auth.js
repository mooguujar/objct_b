import request from '@/utils/request'

export const authApi = {
  // 注册
  register(data) {
    return request.post('/auth/register', data)
  },
  
  // 登录
  login(data) {
    return request.post('/auth/login', data)
  },
  
  // 登出
  logout() {
    return request.post('/auth/logout')
  },
  
  // 刷新Token
  refresh(refreshToken) {
    return request.post('/auth/refresh', { refreshToken })
  },
}

