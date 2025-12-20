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
}

export class BatchReportPageViewDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportPageViewDto)
  pageViews: ReportPageViewDto[]
}

