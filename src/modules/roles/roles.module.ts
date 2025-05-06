import { Module } from '@nestjs/common'

import { RolesController } from './roles.controller'
import { RolesService } from './roles.service'
import { PrismaModule } from 'modules/database/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
