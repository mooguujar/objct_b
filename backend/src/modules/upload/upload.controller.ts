import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import type { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('type') type?: string,
  ) {
    if (!file) {
      throw new Error('文件不能为空');
    }
    const url = await this.uploadService.uploadImage(file, type);
    return { url };
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new Error('文件不能为空');
    }
    const url = await this.uploadService.uploadVideo(file);
    return { url };
  }
}

