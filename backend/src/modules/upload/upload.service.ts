import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import { ImageUtil } from '../../common/utils/image.util';

@Injectable()
export class UploadService {
  private client: OSS;

  constructor(private configService: ConfigService) {
    this.client = new OSS({
      accessKeyId: this.configService.get<string>('OSS_ACCESS_KEY'),
      accessKeySecret: this.configService.get<string>('OSS_ACCESS_SECRET'),
      bucket: this.configService.get<string>('OSS_BUCKET'),
      region: this.configService.get<string>('OSS_REGION'),
      endpoint: this.configService.get<string>('OSS_ENDPOINT'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    if (!file) {
      throw new BadRequestException('文件不能为空');
    }

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.originalname.split('.').pop();
    const filename = `${folder}/${timestamp}-${randomStr}.${ext}`;

    try {
      const result = await this.client.put(filename, file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
        },
      });
      return result.url;
    } catch (error) {
      throw new BadRequestException('文件上传失败');
    }
  }

  async uploadImage(file: Express.Multer.File, compress = true): Promise<string> {
    // 验证图片类型
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('只支持jpg、png、gif、webp格式的图片');
    }

    let buffer = file.buffer;
    
    // 压缩图片
    if (compress) {
      buffer = await ImageUtil.compress(buffer, { quality: 80 });
    }

    // 上传处理后的图片
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.originalname.split('.').pop();
    const filename = `images/${timestamp}-${randomStr}.${ext}`;

    try {
      const result = await this.client.put(filename, buffer, {
        headers: {
          'Content-Type': file.mimetype,
        },
      });
      return result.url;
    } catch (error) {
      throw new BadRequestException('图片上传失败');
    }
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    // 验证视频类型
    const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('只支持mp4、mov、avi格式的视频');
    }

    return this.uploadFile(file, 'videos');
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const key = url.split('.com/')[1];
      await this.client.delete(key);
    } catch (error) {
      // 忽略删除失败的错误
      console.error('删除文件失败:', error);
    }
  }
}

