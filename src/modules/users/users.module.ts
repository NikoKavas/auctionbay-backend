import { Module } from '@nestjs/common'
import { PrismaModule } from 'modules/database/prisma.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { AuthModule } from 'modules/auth/auth.module'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
