import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { User } from '@prisma/client'
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'helpers/imageStorage'
import { PaginatedResult } from 'interfaces/paginated-result.interface'
import { join } from 'path'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'
import { JwtAuthGuard } from 'modules/auth/guards/jwt.guard'
import { S3Service } from 'library/s3.service'

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly s3Service: S3Service) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('page') page = '1'): Promise<PaginatedResult<User>> {
    const pageNumber = parseInt(page, 10) || 1;
    return this.usersService.paginate(pageNumber, 10);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  async upload(@UploadedFile() file: Express.Multer.File, 
  @Param('id') id: string
  ): Promise<User> {
    if (!file) {
    throw new BadRequestException('File must be a png, jpg or jpeg');
  }

  // Upload the image to AWS S3
  const imageUrl = await this.s3Service.uploadFile(file);

  // Save the S3 image URL to the database
  return this.usersService.updateUserImageId(id, imageUrl);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() UpdateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, UpdateUserDto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  @HttpCode(HttpStatus.OK)
  async updateOwnProfile(
    @Req() req,
    @Body() dto: UpdateUserDto
  ): Promise<User> {
    return this.usersService.update(req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id)
  }
}
