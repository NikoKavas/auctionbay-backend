import { Module } from '@nestjs/common'
import { PermissionsController } from './permissions.controller'
import { PermissionsService } from './permissions.service'
import { PrismaModule } from 'modules/database/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
})
export class PermissionsModule {}
