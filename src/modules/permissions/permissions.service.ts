import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import type { Permission } from '@prisma/client'
import Logging from 'library/Logging'


import { CreatePermissionDto } from './dto/create-permission.dto'
import { PrismaService } from 'modules/database/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async findById(id: string): Promise<Permission> {
    const perm = await this.prisma.permission.findUnique({ where: { id } });
    if (!perm) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return perm;
  }

  /** Ustvari novo permission */
  async create(dto: CreatePermissionDto): Promise<Permission> {
    try {
      return await this.prisma.permission.create({ data: dto });
    } catch (error) {
      Logging.error(error);
      throw new BadRequestException(
        'Something went wrong while creating a permission',
      );
    }
  }

  /** Posodobi name obstoječega permission */
  async update(id: string, dto: CreatePermissionDto): Promise<Permission> {
    await this.findById(id);
    try {
      return await this.prisma.permission.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while updating the permission',
      );
    }
  }

  async remove(id: string): Promise<Permission> {
    await this.findById(id);
    try {
      return await this.prisma.permission.delete({ where: { id } });
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while removing the permission',
      );
    }
  }
}

