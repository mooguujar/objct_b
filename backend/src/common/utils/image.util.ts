import * as sharp from 'sharp';

export interface ImageResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export class ImageUtil {
  /**
   * 压缩图片
   */
  static async compress(
    buffer: Buffer,
    options: ImageResizeOptions = {},
  ): Promise<Buffer> {
    const { quality = 80 } = options;
    return sharp(buffer)
      .jpeg({ quality })
      .png({ quality })
      .webp({ quality })
      .toBuffer();
  }

  /**
   * 调整图片尺寸
   */
  static async resize(
    buffer: Buffer,
    options: ImageResizeOptions,
  ): Promise<Buffer> {
    const { width, height } = options;
    return sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  /**
   * 裁剪图片
   */
  static async crop(
    buffer: Buffer,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<Buffer> {
    return sharp(buffer)
      .extract({ left: x, top: y, width, height })
      .toBuffer();
  }

  /**
   * 转换图片格式
   */
  static async convert(buffer: Buffer, format: 'jpeg' | 'png' | 'webp'): Promise<Buffer> {
    return sharp(buffer)[format]().toBuffer();
  }

  /**
   * 获取图片信息
   */
  static async getMetadata(buffer: Buffer) {
    return sharp(buffer).metadata();
  }

  /**
   * 生成缩略图
   */
  static async generateThumbnail(
    buffer: Buffer,
    size: number = 200,
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  }
}

