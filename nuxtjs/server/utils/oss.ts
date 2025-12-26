// 类型声明
type OSSClient = {
  put(name: string, file: Buffer | string): Promise<{ url: string }>
}

type OSSConstructor = new (config: {
  bucket: string
  endpoint: string
  region: string
  accessKeyId: string
  accessKeySecret: string
}) => OSSClient

// 使用 createRequire 在 ES 模块中加载 CommonJS 模块
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

let OSSClient: OSSConstructor | null = null

function getOSSClient(): OSSConstructor {
  if (!OSSClient) {
    try {
      // 使用 require 加载 CommonJS 模块
      const OSS = require('ali-oss')
      // ali-oss 使用 export = 导出
      OSSClient = (OSS.default || OSS) as unknown as OSSConstructor
      if (!OSSClient) {
        throw new Error('ali-oss module is not available')
      }
    } catch (error: any) {
      console.error('Failed to load ali-oss:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      })
      throw new Error(`Failed to load ali-oss module: ${error?.message || error}`)
    }
  }
  return OSSClient
}

export function createOSSClient(config: {
  bucket: string
  endpoint: string
  region: string
  accessKeyId: string
  accessKeySecret: string
}) {
  const Client = getOSSClient()
  if (!Client) {
    throw new Error('Failed to load ali-oss module')
  }
  return new Client({
    bucket: config.bucket,
    endpoint: config.endpoint,
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
  })
}

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
) {
  const client = createOSSClient(config)
  const result = await client.put(fileName, file)
  return result.url
}

