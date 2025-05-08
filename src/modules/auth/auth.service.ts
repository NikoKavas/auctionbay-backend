import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { User } from '@prisma/client'
import { Request } from 'express'
import Logging from 'library/Logging'
import { UsersService } from 'modules/users/users.service'
import { compareHash, hash } from 'utils/bycrpt'

import { RegisterUserDto } from './dto/register-user.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<User> {
    Logging.info('Validating user...')
    const user = await this.usersService.findBy({ email: email })
    if (!user) {
      throw new BadRequestException('Invalid credentials')
    }
    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException('Invalid credentials(password)')
    }

    Logging.info('User validated successfully')
    return user
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword = await hash(registerUserDto.password)
    return this.usersService.create({
      role_id: undefined,
      ...registerUserDto,
      password: hashedPassword,
    })
  }

  async generateJwt(user: User): Promise<string> {
    return this.jwtService.signAsync({ sub: user.id, name: user.email })
  }

  async user(cookie: string): Promise<User> {
    const data = await this.jwtService.verifyAsync(cookie)
    const user = await this.usersService.findBy({ id: data.sub });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async getUserId(request: Request): Promise<string> {
    const user = request.user as User
    return user.id
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.usersService.findById(userId);

    if (!(await compareHash(dto.oldPassword, user.password))) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }
    const newHash = await hash(dto.newPassword);
    return this.usersService.changePassword(userId, newHash);
  }

}
