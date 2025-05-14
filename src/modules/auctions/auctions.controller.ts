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
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard'; // ali kako se imenuje tvoj JWT guard
  import { AuctionsService } from './auctions.service';
  import { CreateAuctionDto } from './dto/create-auction.dto';
  import { UpdateAuctionDto } from './dto/update-auction.dto';
  import { BidDto } from './dto/bid.dto';
import { Auction } from '@prisma/client';
  
  @Controller()
  export class AuctionsController {
    constructor(private readonly auctions: AuctionsService) {}
  
    // /me/auction 
    @UseGuards(JwtAuthGuard)
    @Post('me/auction')
    @HttpCode(HttpStatus.CREATED)
    createForMe(@Req() req, @Body() dto: CreateAuctionDto) {
      return this.auctions.createForUser(req.user.id, dto);
    }
  
    // /me/auction/:id 
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
  
    // /auctions 
    @Get('auctions')
    @HttpCode(HttpStatus.OK)
    listActive() {
      return this.auctions.listActive();
    }

    @Get('auctions/:id')
    @HttpCode(HttpStatus.OK)
    getOne(@Param('id') id: string): Promise<Auction> {
      return this.auctions.findById(id); // implementiraš v service, vključi tudi bids
    }
  
    // /auctions/:id/bid 
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
  }
  