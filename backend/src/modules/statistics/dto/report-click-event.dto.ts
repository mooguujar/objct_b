import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ReportClickEventDto {
  @IsString()
  eventType: string

  @IsString()
  @IsOptional()
  elementId?: string

  @IsString()
  @IsOptional()
  elementType?: string

  @IsString()
  pagePath: string

  @IsNumber()
  @IsOptional()
  clickPositionX?: number

  @IsNumber()
  @IsOptional()
  clickPositionY?: number

  @IsNumber()
  @IsOptional()
  relatedId?: number

  @IsString()
  @IsOptional()
  relatedType?: string
}

export class BatchReportClickEventDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportClickEventDto)
  clickEvents: ReportClickEventDto[]
}

