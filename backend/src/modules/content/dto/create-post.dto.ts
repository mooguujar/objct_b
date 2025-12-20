import { IsOptional, IsString, IsArray, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PostMediaType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  MIXED = 'mixed',
}

export class CreatePostDto {
  @IsOptional()
  @Transform(({ value }) => value ? BigInt(value) : null)
  islandId?: bigint;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(PostMediaType)
  mediaType: PostMediaType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}

