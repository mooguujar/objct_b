import { IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';

export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

export class RechargeDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

