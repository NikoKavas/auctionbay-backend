import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import type { Permission } from '@prisma/client'

import { CreatePermissionDto } from './dto/create-permission.dto'
import { PermissionsService } from './permissions.service'

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Permission[]> {
    return await this.permissionService.findAll()
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return await this.permissionService.create(createPermissionDto)
  }
}
