import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private client: OSS;

  constructor(private configService: ConfigService) {
    this.client = new OSS({
      region: this.configService.get<string>('OSS_REGION'),
      accessKeyId: this.configService.get<string>('OSS_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get<string>('OSS_ACCESS_KEY_SECRET'),
      bucket: this.configService.get<string>('OSS_BUCKET'),
    });
  }

  async uploadImage(file: Express.Multer.File, type = 'image'): Promise<string> {
    // 图片压缩处理
    const processedBuffer = await sharp(file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const fileName = `${type}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const result = await this.client.put(fileName, processedBuffer);
    return result.url;
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    const fileName = `video/${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
    const result = await this.client.put(fileName, file.buffer);
    return result.url;
  }
}

