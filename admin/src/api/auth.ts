import { request } from './request'

export const authApi = {
  adminLogin(data: { username: string; password: string }) {
    return request.post('/admin/auth/login', data)
  },
}

