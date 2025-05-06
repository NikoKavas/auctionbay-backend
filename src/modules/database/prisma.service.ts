import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // ko se modul zažene, poveži PrismaClient na bazo
  async onModuleInit() {
    await this.$connect();
  }

}
