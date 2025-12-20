import { IsOptional, IsString, IsArray, IsEmail } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  realName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualificationUrls?: string[];
}

