import axios from 'axios'

const baseURL = 'http://localhost:3000/api/v1'

const instance = axios.create({
  baseURL,
  timeout: 10000,
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加Token
    const token = uni.getStorageSync('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加平台标识
    config.headers['X-Platform'] = 'app'
    
    // 添加设备ID（用于统计）
    const deviceId = uni.getStorageSync('deviceId') || generateDeviceId()
    if (!uni.getStorageSync('deviceId')) {
      uni.setStorageSync('deviceId', deviceId)
    }
    config.headers['X-Device-Id'] = deviceId
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data
    
    // 请求成功
    if (code === 200) {
      return data
    }
    
    // Token过期，尝试刷新
    if (code === 401) {
      return handleTokenRefresh(response.config)
    }
    
    // 其他错误
    uni.showToast({
      title: message || '请求失败',
      icon: 'none',
    })
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    // 网络错误
    if (!error.response) {
      uni.showToast({
        title: '网络连接失败',
        icon: 'none',
      })
      return Promise.reject(error)
    }
    
    const { status, data } = error.response
    
    // 401未授权，尝试刷新Token
    if (status === 401) {
      return handleTokenRefresh(error.config)
    }
    
    // 其他错误
    uni.showToast({
      title: data?.message || '请求失败',
      icon: 'none',
    })
    return Promise.reject(error)
  }
)

// 处理Token刷新
async function handleTokenRefresh(originalRequest) {
  const refreshToken = uni.getStorageSync('refreshToken')
  
  if (!refreshToken) {
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login',
    })
    return Promise.reject(new Error('未登录'))
  }
  
  try {
    // 刷新Token
    const response = await axios.post(`${baseURL}/auth/refresh`, {
      refreshToken,
    })
    
    const { token, refreshToken: newRefreshToken } = response.data.data
    
    // 保存新Token
    uni.setStorageSync('token', token)
    uni.setStorageSync('refreshToken', newRefreshToken)
    
    // 重新发起原请求
    originalRequest.headers.Authorization = `Bearer ${token}`
    return instance(originalRequest)
  } catch (error) {
    // 刷新失败，跳转到登录页
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
    uni.reLaunch({
      url: '/pages/login/login',
    })
    return Promise.reject(error)
  }
}

// 生成设备ID
function generateDeviceId() {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
}

export default instance

