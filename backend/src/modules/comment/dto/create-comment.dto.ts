import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @Transform(({ value }) => BigInt(value))
  postId: bigint;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @Transform(({ value }) => value ? BigInt(value) : null)
  parentId?: bigint;
}

