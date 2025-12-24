import OSS from 'ali-oss'

export function createOSSClient(config: {
  bucket: string
  endpoint: string
  region: string
  accessKeyId: string
  accessKeySecret: string
}) {
  return new OSS({
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

