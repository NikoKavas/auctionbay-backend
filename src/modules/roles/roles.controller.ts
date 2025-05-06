import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import type { Permission, Role } from '@prisma/client'
import { PaginatedResult } from 'interfaces/paginated-result.interface'

import { CreateUpdateRoleDto } from './dto/create-update-role.dto'
import { RolesService } from './roles.service'

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<(Role & { permissions: Permission[] })[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
  ): Promise<Role & { permissions: Permission[] }> {
    return this.rolesService.findById(id);
  }

  @Post()
@HttpCode(HttpStatus.CREATED)
async create(
  @Body() dto: CreateUpdateRoleDto,
): Promise<Role & { permissions: Permission[] }> {
  // dto.name in dto.permissions sta že tu
  return this.rolesService.create(dto, dto.permissions);
}

@Patch(':id')
@HttpCode(HttpStatus.OK)
async update(
  @Param('id') id: string,
  @Body() dto: CreateUpdateRoleDto,
): Promise<Role & { permissions: Permission[] }> {
  return this.rolesService.update(id, dto, dto.permissions);
}

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Role> {
    return this.rolesService.remove(id)
  }
}
