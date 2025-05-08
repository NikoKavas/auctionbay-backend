// src/modules/users/users.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { User } from '@prisma/client';
import { hash, compareHash } from 'utils/bycrpt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import Logging from 'library/Logging';
import { PaginatedResult } from 'interfaces/paginated-result.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Vrne vse uporabnike */
  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException('Cannot fetch users');
    }
  }

  async findBy(
    condition: Partial<User>,
    includeRole = false,
  ): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: condition,
        include: includeRole ? { role: true } : undefined,
      });
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while searching for a user by condition: ' +
          JSON.stringify(condition),
      );
    }
  }
  /** Poišče uporabnika po ID-ju ali vrže BadRequest */
  async findById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new BadRequestException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      Logging.error(error);
      throw new InternalServerErrorException('Error fetching user by id');
    }
  }

  async paginate(page = 1, take = 10): Promise<PaginatedResult<User>> {
    try {
      const skip = (page - 1) * take;
      const [data, total] = await Promise.all([
        this.prisma.user.findMany({ skip, take, include: { role: true } }),
        this.prisma.user.count(),
      ]);

      return {
        data,
        meta: {
          total,
          page,
          last_page: Math.ceil(total / take),
        },
      };
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException('Error paginating users');
    }
  }

  /** Ustvari novega uporabnika */
  async create(dto: CreateUserDto): Promise<User> {
    // Preveri unikatnost e-pošte
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('User already exists with this email');
    }

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          first_name: dto.first_name,
          last_name: dto.last_name,
          password: dto.password,
          // če uporabljaš role povezavo:
          role: dto.role_id ? { connect: { id: dto.role_id } } : undefined,
        },
      });
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException('Something went wrong while creating a user');
    }
  }

  /** Posodobi obstoječega uporabnika */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Če spreminjaš email, preveri še enkrat unikatnost
    if (dto.email && dto.email !== user.email) {
      const other = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (other) {
        throw new BadRequestException('Another user already uses this email');
      }
    }

    if (dto.password) {
      if (await compareHash(dto.password, user.password)) {
        throw new BadRequestException('New password cannot be the same as the old password');
      }
      dto.password = await hash(dto.password);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          email: dto.email,
          first_name: dto.first_name,
          last_name: dto.last_name,
          avatar: dto.avatar,
          password: dto.password,
          role: dto.role_id ? { connect: { id: dto.role_id } } : undefined,
        },
      });
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException('Something went wrong while updating the user');
    }
  }

  async remove(id: string): Promise<User> {
    await this.findById(id);
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      Logging.error(error);
      throw new InternalServerErrorException('Something went wrong while removing the user');
    }
  }

  async updateUserImageId(id: string, avatar: string): Promise<User> {
    return this.update(id, { avatar } as UpdateUserDto);
  }

  async changePassword(userId: string, newHashedPassword: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { password: newHashedPassword },
      });
    } catch (err) {
      throw new InternalServerErrorException('Could not update password');
    }
  }
}
