import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Public } from 'decorators/public.decorator'
import type { User } from '@prisma/client'
import { Response } from 'express'
import { Request } from 'express'
import { RequestWithUser } from 'interfaces/auth.interface'

import { AuthService } from './auth.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { UpdatePasswordDto } from './dto/update-password.dto'
import { JwtAuthGuard } from './guards/jwt.guard'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto): Promise<User> {
    return this.authService.register(body)
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response): Promise<User> {
    const access_token = await this.authService.generateJwt(req.user)
    res.cookie('access_token', access_token, { httpOnly: true })
    return req.user
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async user(@Req() req: Request): Promise<User> {
    const cookie = req.cookies['access_token']
    return this.authService.user(cookie)
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Res({ passthrough: true }) res: Response): Promise<{ msg: string }> {
    res.clearCookie('access_token')
    return { msg: 'ok' }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Req() req: Request,                    
    @Body() dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const cookie = req.cookies['access_token'];
    const user = await this.authService.user(cookie);
    await this.authService.updatePassword(user.id, dto);
    return { message: 'Password updated successfully' };
  }
}
