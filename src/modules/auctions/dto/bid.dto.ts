import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class BidDto {
  @IsNotEmpty() @IsNumber()
  amount: number;

  @IsOptional() @IsNumber()
  maxAmount?: number;
}