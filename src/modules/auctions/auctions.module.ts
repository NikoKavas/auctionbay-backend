import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';

@Module({
  controllers: [AuctionsController],
  providers: [AuctionsService]
})
export class AuctionsModule {}
