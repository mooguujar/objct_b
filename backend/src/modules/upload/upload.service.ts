import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import * as sharp from 'sharp';
import type { Express } from 'express';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private client: OSS;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const accessKeyId = this.configService.get<string>('OSS_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get<string>('OSS_ACCESS_KEY_SECRET');
    const bucket = this.configService.get<string>('OSS_BUCKET');
    const endpoint = this.configService.get<string>('OSS_ENDPOINT');
    const region = this.configService.get<string>('OSS_REGION');

    if (!accessKeyId || !accessKeySecret || !bucket || !endpoint) {
      this.logger.warn('OSS 配置不完整，文件上传功能可能无法使用');
      return;
    }

    try {
      this.client = new OSS({
        accessKeyId,
        accessKeySecret,
        bucket,
        endpoint,
        ...(region && { region }),
      });
      this.logger.log('OSS 客户端初始化成功');
    } catch (error) {
      this.logger.error('OSS 客户端初始化失败', error);
    }
  }

  async uploadImage(file: Express.Multer.File, type = 'image'): Promise<string> {
    if (!this.client) {
      throw new Error('OSS 客户端未初始化，请检查配置');
    }

    try {
      // 图片压缩处理
      const processedBuffer = await sharp(file.buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const fileName = `${type}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const result = await this.client.put(fileName, processedBuffer);
      this.logger.log(`图片上传成功: ${result.url}`);
      return result.url;
    } catch (error) {
      this.logger.error('图片上传失败', error);
      throw new Error(`图片上传失败: ${error.message}`);
    }
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    if (!this.client) {
      throw new Error('OSS 客户端未初始化，请检查配置');
    }

    try {
      const fileName = `video/${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
      const result = await this.client.put(fileName, file.buffer);
      this.logger.log(`视频上传成功: ${result.url}`);
      return result.url;
    } catch (error) {
      this.logger.error('视频上传失败', error);
      throw new Error(`视频上传失败: ${error.message}`);
    }
  }

  async deleteFile(url: string): Promise<void> {
    if (!this.client) {
      throw new Error('OSS 客户端未初始化，请检查配置');
    }

    try {
      // 从 URL 中提取文件名
      const fileName = url.split('/').pop();
      if (fileName) {
        await this.client.delete(fileName);
        this.logger.log(`文件删除成功: ${fileName}`);
      }
    } catch (error) {
      this.logger.error('文件删除失败', error);
      throw new Error(`文件删除失败: ${error.message}`);
    }
  }
}

