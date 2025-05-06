// src/modules/roles/roles.service.ts

import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { Role, Permission } from '@prisma/client';
import { CreateUpdateRoleDto } from './dto/create-update-role.dto';
import Logging from 'library/Logging';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Vrne vse role z njihovimi permissions */
  async findAll(): Promise<(Role & { permissions: Permission[] })[]> {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  /** Poišče eno rolo po ID-ju in vrne tudi permissions */
  async findById(id: string): Promise<Role & { permissions: Permission[] }> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  /** Ustvari nov role in poveže permissions */
  async create(
    dto: CreateUpdateRoleDto,
    permissionsIds: Permission['id'][],
  ): Promise<Role & { permissions: Permission[] }> {
    try {
      return await this.prisma.role.create({
        data: {
          name: dto.name,
          permissions: {
            connect: permissionsIds.map((id) => ({ id })),
          },
        },
        include: { permissions: true },
      });
    } catch (error) {
      Logging.error(error);
      throw new BadRequestException(
        'Something went wrong while creating a role',
      );
    }
  }

  /** Posodobi ime role in nastavi nabor permissions */
  async update(
    id: string,
    dto: CreateUpdateRoleDto,
    permissionsIds: Permission['id'][],
  ): Promise<Role & { permissions: Permission[] }> {
    await this.findById(id);
    try {
      return await this.prisma.role.update({
        where: { id },
        data: {
          name: dto.name,
          permissions: {
            set: permissionsIds.map((id) => ({ id })),
          },
        },
        include: { permissions: true },
      });
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while updating the role',
      );
    }
  }

  /** Izbriše role */
  async remove(id: string): Promise<Role> {
    const role = await this.findById(id);
    try {
      return await this.prisma.role.delete({ where: { id } });
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while removing the role',
      );
    }
  }
}
