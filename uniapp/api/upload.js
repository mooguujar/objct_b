import request from '@/utils/request'

export const uploadApi = {
  // 上传图片
  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: request.defaults.baseURL + '/upload/image',
        filePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${uni.getStorageSync('token')}`,
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 200) {
              resolve({ data: { url: data.data.url } })
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('响应解析失败'))
          }
        },
        fail: (error) => {
          reject(error)
        },
      })
    })
  },

  // 上传视频
  uploadVideo(filePath) {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: request.defaults.baseURL + '/upload/video',
        filePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${uni.getStorageSync('token')}`,
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 200) {
              resolve({ data: { url: data.data.url } })
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('响应解析失败'))
          }
        },
        fail: (error) => {
          reject(error)
        },
      })
    })
  },

  // 上传文件
  uploadFile(filePath) {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: request.defaults.baseURL + '/upload/file',
        filePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${uni.getStorageSync('token')}`,
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 200) {
              resolve({ data: { url: data.data.url } })
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('响应解析失败'))
          }
        },
        fail: (error) => {
          reject(error)
        },
      })
    })
  },
}

