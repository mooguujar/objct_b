import { getCurrentUser } from '../../utils/jwt'
import { uploadToOSS } from '../../utils/oss'
import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const config = useRuntimeConfig(event)
  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: '请选择文件'
    })
  }

  const file = formData[0]
  if (!file.data || !file.filename) {
    throw createError({
      statusCode: 400,
      message: '文件无效'
    })
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!file.type || !allowedTypes.includes(file.type)) {
    throw createError({
      statusCode: 400,
      message: '只支持图片格式：jpg, png, gif, webp'
    })
  }

  // 验证文件大小（最大5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.data.length > maxSize) {
    throw createError({
      statusCode: 400,
      message: '图片大小不能超过5MB'
    })
  }

  // 生成文件名
  const ext = file.filename.split('.').pop() || 'jpg'
  const fileName = `avatars/${currentUser.userId}_${Date.now()}.${ext}`

  // 上传到OSS
  const ossConfig = {
    bucket: config.ossBucket,
    endpoint: config.ossEndpoint,
    region: config.ossRegion,
    accessKeyId: config.ossAccessKeyId,
    accessKeySecret: config.ossAccessKeySecret
  }

  try {
    const url = await uploadToOSS(file.data, fileName, ossConfig)
    
    return {
      code: 200,
      message: '上传成功',
      data: {
        url
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || '上传失败'
    })
  }
})

