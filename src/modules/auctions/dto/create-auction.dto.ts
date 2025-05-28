import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateAuctionDto {
  @IsNotEmpty() @IsString()
  title: string;

  @IsNotEmpty() @IsString()
  description: string;

  @IsOptional() @IsString()
  image: string;    // ime fajla ali path

  @IsNotEmpty() 
  @Type(() => Number) 
  @IsNumber()
  startingBid: number;

  @IsNotEmpty() @IsDateString()
  endTime: string;  // ISO timestamp
}