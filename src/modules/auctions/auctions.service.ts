import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { BidDto } from './dto/bid.dto';
import type { Auction, Bid } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuctionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  //Seznam aktivnih avkcij
  async listActive(): Promise<Auction[]> {
    const now = new Date();
    return this.prisma.auction.findMany({
      where: { endTime: { gt: now } },
      orderBy: { endTime: 'asc' },
      include: {
        bids: {
          orderBy: { createdAt: 'desc' }  
        }
      }
    });
  }

    async findById(id: string): Promise<Auction> {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: { bids: { orderBy: { createdAt: 'desc' } } },
    });
    if (!auction) throw new NotFoundException('Auction not found');
    return auction;
  }

  // Ustvari novo avkcijo za prijavljenega userja 
  async createForUser(userId: string, dto: CreateAuctionDto): Promise<Auction> {
    return this.prisma.auction.create({
      data: {
        ...dto,
        startingBid: dto.startingBid,
        endTime: new Date(dto.endTime),
        user: { connect: { id: userId } },
      },
    });
  }

  // Posodobi userjovo avkcijo 
  async updateForUser(userId: string, auctionId: string, dto: UpdateAuctionDto): Promise<Auction> {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.userId !== userId) throw new ForbiddenException('Not your auction');
    return this.prisma.auction.update({
      where: { id: auctionId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.image && { image: dto.image }),
        ...(dto.startingBid != null && { startingBid: dto.startingBid }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
      },
    });
  }

  // Oddaj bid na avkcijo 
  async bidOnAuction(userId: string, auctionId: string, dto: BidDto): Promise<Bid> {
    // preveri, ali aukcija obstaja in je še aktivna
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.endTime < new Date()) throw new BadRequestException('Auction has ended');

    // tu bi lahko dodal še logiko za minimalni increment ipd.
    return this.prisma.bid.create({
      data: {
        amount: dto.amount,
        maxAmount: dto.maxAmount,
        auction: { connect: { id: auctionId } },
        user: { connect: { id: userId } },
      },
    });
  }

  async listForUser(userId: string): Promise<Auction[]> {
    return this.prisma.auction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { bids: { orderBy: { createdAt: 'desc' } } },
    });
  }
}