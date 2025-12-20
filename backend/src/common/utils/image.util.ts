import * as sharp from 'sharp';

export class ImageUtil {
  static async compressImage(
    buffer: Buffer,
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85,
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality })
      .toBuffer();
  }

  static async resizeImage(
    buffer: Buffer,
    width: number,
    height: number,
  ): Promise<Buffer> {
    return sharp(buffer).resize(width, height).toBuffer();
  }

  static async getImageInfo(buffer: Buffer) {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
    };
  }
}

