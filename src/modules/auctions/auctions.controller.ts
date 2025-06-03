// src/modules/auctions/auctions.controller.ts

import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Delete,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard'; // ali kako se imenuje tvoj JWT guard
  import { AuctionsService } from './auctions.service';
  import { CreateAuctionDto } from './dto/create-auction.dto';
  import { UpdateAuctionDto } from './dto/update-auction.dto';
  import { BidDto } from './dto/bid.dto';
import { Auction } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveImageToStorage } from 'helpers/imageStorage';
  
  @Controller()
  export class AuctionsController {
    constructor(private readonly auctions: AuctionsService) {}
  
  
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image', saveImageToStorage))
    @Post('me/auction')
    @HttpCode(HttpStatus.CREATED)
    createForMe(
      @Req() req, 
      @UploadedFile() file: Express.Multer.File, 
      @Body() dto: CreateAuctionDto
    ) {
      const payload = {
      ...dto,
      image: file.filename,                         // DTO.image bo zdaj filename
    };
      return this.auctions.createForUser(req.user.id, payload);
    }
  
    @UseGuards(JwtAuthGuard)
    @Patch('me/auction/:id')
    @HttpCode(HttpStatus.OK)
    updateForMe(
      @Req() req,
      @Param('id') auctionId: string,
      @Body() dto: UpdateAuctionDto,
    ) {
      return this.auctions.updateForUser(req.user.id, auctionId, dto);
    }
  
    @Get('auctions')
    @HttpCode(HttpStatus.OK)
    listActive() {
      return this.auctions.listActive();
    }

    @Get('auctions/:id')
    @HttpCode(HttpStatus.OK)
    getOne(@Param('id') id: string) {
      return this.auctions.findById(id)
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('auctions/:id/bid')
    @HttpCode(HttpStatus.CREATED)
    bid(
      @Req() req,
      @Param('id') auctionId: string,
      @Body() dto: BidDto,
    ) {
      return this.auctions.bidOnAuction(req.user.id, auctionId, dto);
    }

    
    @UseGuards(JwtAuthGuard)
    @Get('me/auction')
    @HttpCode(HttpStatus.OK)
    listForMe(@Req() req) {
    return this.auctions.listForUser(req.user.id);
}

    @UseGuards(JwtAuthGuard)
    @Get('me/bidding')
    @HttpCode(HttpStatus.OK)
    listBiddingForMe(@Req() req) {
      return this.auctions.listBiddingForUser(req.user.id);
    }

   @Delete('auctions/:id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<Auction> {
      return this.auctions.remove(id); 
    }

  }
  