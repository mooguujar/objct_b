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

  // 验证文件大小（最大10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.data.length > maxSize) {
    throw createError({
      statusCode: 400,
      message: '图片大小不能超过10MB'
    })
  }

  // 生成文件名
  const ext = file.filename.split('.').pop() || 'jpg'
  const fileName = `backgrounds/${currentUser.userId}_${Date.now()}.${ext}`

  // 上传到OSS
  const ossConfig = {
    bucket: config.ossBucket,
    endpoint: config.ossEndpoint,
    region: config.ossRegion,
    accessKeyId: config.ossAccessKeyId,
    accessKeySecret: config.ossAccessKeySecret
  }

  // 验证OSS配置
  const missingConfigs: string[] = []
  if (!ossConfig.bucket) missingConfigs.push('OSS_BUCKET')
  if (!ossConfig.endpoint) missingConfigs.push('OSS_ENDPOINT')
  if (!ossConfig.region) missingConfigs.push('OSS_REGION')
  if (!ossConfig.accessKeyId) missingConfigs.push('OSS_ACCESS_KEY_ID 或 OSS_ACCESS_KE')
  if (!ossConfig.accessKeySecret) missingConfigs.push('OSS_ACCESS_KEY_SECRET 或 OSS_ACCESS_s')
  
  if (missingConfigs.length > 0) {
    console.error('OSS配置检查失败:', {
      missing: missingConfigs,
      configStatus: {
        bucket: ossConfig.bucket ? `已设置(${ossConfig.bucket.length}字符)` : '未设置',
        endpoint: ossConfig.endpoint ? `已设置(${ossConfig.endpoint.length}字符)` : '未设置',
        region: ossConfig.region ? `已设置(${ossConfig.region.length}字符)` : '未设置',
        accessKeyId: ossConfig.accessKeyId ? `已设置(${ossConfig.accessKeyId.length}字符)` : '未设置',
        accessKeySecret: ossConfig.accessKeySecret ? `已设置(${ossConfig.accessKeySecret.length}字符)` : '未设置'
      }
    })
    throw createError({
      statusCode: 500,
      message: `OSS配置不完整，缺少以下配置项：${missingConfigs.join(', ')}。请检查 .env 文件是否在 nuxtjs 目录下，并确保已重启服务器。`
    })
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

