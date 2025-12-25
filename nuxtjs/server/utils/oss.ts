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

import OSS from 'ali-oss'
const OSSClient = OSS as unknown as OSSConstructor

export function createOSSClient(config: {
  bucket: string
  endpoint: string
  region: string
  accessKeyId: string
  accessKeySecret: string
}) {
  return new OSSClient({
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

