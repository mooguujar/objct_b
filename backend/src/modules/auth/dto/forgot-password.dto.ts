import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsOptional()
  @IsString()
  code?: string; // 验证码
}

