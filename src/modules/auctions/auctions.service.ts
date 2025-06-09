import { Injectable, BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { BidDto } from './dto/bid.dto';
import type { Auction, Bid, User } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import Logging from 'library/Logging';

@Injectable()
export class AuctionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

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

    async findById(
    id: string
  ): Promise<
    Auction & {
      bids: (Bid & {
        user: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar'>
      })[]
    }
  > {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`)
    }
    return auction
  }


  async remove(id: string): Promise<Auction> {
      await this.findById(id);
      try {
        await this.prisma.bid.deleteMany({
          where: { auctionId: id }
        });
        return await this.prisma.auction.delete({ where: { id } });
      } catch (error) {
        Logging.error(error);
        throw new InternalServerErrorException('Something went wrong while removing the user');
      }
    }
  
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

  async updateForUser(
    userId: string,
    auctionId: string,
    dto: CreateAuctionDto
  ): Promise<Auction> {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.userId !== userId) throw new ForbiddenException('Not your auction');

    return this.prisma.auction.update({
      where: { id: auctionId },
      data: {
        title:        dto.title,
        description:  dto.description,
        image:        dto.image,
        ...(dto.startingBid != null && { startingBid: dto.startingBid }),
        endTime:      new Date(dto.endTime),
      },
      include: {
      bids: true, 
      },
    });
  }


  async bidOnAuction(userId: string, auctionId: string, dto: BidDto): Promise<Bid> {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.endTime < new Date()) throw new BadRequestException('Auction has ended');

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

  async listBiddingForUser(userId: string): Promise<Auction[]> {
    return this.prisma.auction.findMany({
      where: {
        endTime: { gt: new Date() },
        bids: { some: { userId } },
      },
      orderBy: { endTime: 'asc' },
      include: {
        bids: { orderBy: { createdAt: 'desc' } },
      }
    })
  }


  async listWonForUser(userId: string): Promise<Auction[]> {
  const now = new Date();

  const auctions = await this.prisma.auction.findMany({
    where: {
      endTime: { lt: now },
      bids:    { some: { userId } },
    },
    include: {
      bids: {
        orderBy: { amount: 'desc' },  // najprej največje
        include: {
          user: { select: { id: true, first_name: true, last_name: true, avatar: true } }
        }
      }
    }
  });

  return auctions.filter(a =>
    a.bids.length > 0 && a.bids[0].userId === userId
  );
}
  
}