import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ReportPageViewDto {
  @IsString()
  pagePath: string

  @IsString()
  @IsOptional()
  pageTitle?: string

  @IsString()
  @IsOptional()
  deviceType?: string

  @IsString()
  @IsOptional()
  platform?: string

  @IsString()
  @IsOptional()
  referrer?: string

  @IsNumber()
  @IsOptional()
  stayDuration?: number

  // 允许客户端发送，但服务器端会重新设置
  @IsString()
  @IsOptional()
  userId?: string

  @IsNumber()
  @IsOptional()
  timestamp?: number
}

export class BatchReportPageViewDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportPageViewDto)
  pageViews: ReportPageViewDto[]
}

