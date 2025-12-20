import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 检查用户名是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          ...(createUserDto.phone ? [{ phone: createUserDto.phone }] : []),
          ...(createUserDto.email ? [{ email: createUserDto.email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('用户名、手机号或邮箱已存在');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        passwordHash,
        nickname: createUserDto.nickname,
        phone: createUserDto.phone,
        email: createUserDto.email,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findOne(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        backgroundImage: true,
        gender: true,
        birthday: true,
        role: true,
        isVerified: true,
        coinBalance: true,
        followCount: true,
        followerCount: true,
        postCount: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async update(id: bigint, updateData: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }
}

