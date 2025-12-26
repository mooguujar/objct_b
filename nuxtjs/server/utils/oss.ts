import crypto from 'crypto'

// 使用阿里云 OSS REST API 上传文件，避免 SDK 打包问题
export async function uploadToOSS(
  file: Buffer,
  fileName: string,
  config: {
    bucket: string
    endpoint: string
    region: string
    accessKeyId: string
    accessKeySecret: string
  }
): Promise<string> {
  const { bucket, endpoint, accessKeyId, accessKeySecret } = config
  const host = `${bucket}.${endpoint}`
  const url = `https://${host}/${fileName}`
  const date = new Date().toUTCString()
  const contentType = 'application/octet-stream'
  
  // 构建 CanonicalizedResource
  const canonicalizedResource = `/${bucket}/${fileName}`
  
  // 构建 StringToSign（格式：HTTP-Verb + "\n" + Content-MD5 + "\n" + Content-Type + "\n" + Date + "\n" + CanonicalizedResource）
  const stringToSign = `PUT\n\n${contentType}\n${date}\n${canonicalizedResource}`
  
  // 计算签名
  const signature = crypto
    .createHmac('sha1', accessKeySecret)
    .update(stringToSign)
    .digest('base64')
  
  // 构建 Authorization
  const authorization = `OSS ${accessKeyId}:${signature}`
  
  // 发送 PUT 请求上传文件（将 Buffer 转换为 Uint8Array）
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': authorization,
      'Date': date,
      'Content-Type': contentType,
      'Content-Length': file.length.toString()
    },
    body: new Uint8Array(file)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OSS upload failed: ${response.status} ${response.statusText} - ${errorText}`)
  }
  
  // 返回文件 URL
  return url
}
