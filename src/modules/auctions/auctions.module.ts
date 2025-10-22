import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { PrismaModule } from 'modules/database/prisma.module';
import { AuthModule } from 'modules/auth/auth.module';
import { S3Service } from 'library/s3.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AuctionsController],
  providers: [AuctionsService, S3Service],
})
export class AuctionsModule {}
