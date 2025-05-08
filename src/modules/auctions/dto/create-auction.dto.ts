import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateAuctionDto {
  @IsNotEmpty() @IsString()
  title: string;

  @IsNotEmpty() @IsString()
  description: string;

  @IsNotEmpty() @IsString()
  image: string;    // ime fajla ali path

  @IsNotEmpty() @IsNumber()
  startingBid: number;

  @IsNotEmpty() @IsDateString()
  endTime: string;  // ISO timestamp
}