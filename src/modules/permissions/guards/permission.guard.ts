// src/modules/permissions/permission.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'modules/auth/auth.service';
import { PrismaService } from 'modules/database/prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Preberi katero entiteto (resource) želimo zaščititi:
    // @Permissions('auction') → access = 'auction'
    const access: string = this.reflector.get<string>(
      'access',
      context.getHandler(),
    );
    if (!access) {
      // če ni @Permissions dekoratorja, dovolimo
      return true;
    }

    // Pridobi HTTP request in JWT kolaček
    const req = context.switchToHttp().getRequest();
    const cookie = req.cookies['access_token'];
    if (!cookie) {
      throw new ForbiddenException('Missing authentication token');
    }

    // Iz piše user ID iz JWT
    const user = await this.authService.user(cookie);
    if (!user.role_id) {
      throw new ForbiddenException('User has no role assigned');
    }

    // Naloži role skupaj z njihovimi permissions
    const role = await this.prisma.role.findUnique({
      where: { id: user.role_id },
      include: { permissions: true },
    });
    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    // GET sme pogledati (“view_X”) ali urejati (“edit_X”)
    const viewPerm  = `view_${access}`;
    const editPerm  = `edit_${access}`;
    const hasView   = role.permissions.some(p => p.name === viewPerm);
    const hasEdit   = role.permissions.some(p => p.name === editPerm);

    if (req.method === 'GET') {
      if (!hasView && !hasEdit) {
        throw new ForbiddenException(
          `Insufficient permissions to view ${access}`,
        );
      }
      return true;
    }

    // za vse ostalo (POST, PATCH, DELETE...) zahtevamo edit
    if (!hasEdit) {
      throw new ForbiddenException(
        `Insufficient permissions to modify ${access}`,
      );
    }
    return true;
  }
}
