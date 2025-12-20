import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { phone: username },
          { email: username },
        ],
        status: 'active',
      },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // 将 BigInt 转换为字符串，避免序列化问题
    const userId = typeof user.id === 'bigint' ? user.id.toString() : user.id;
    const payload = { username: user.username, sub: userId };
    
    // 处理 user 对象中的 BigInt 字段
    const userResponse = {
      ...user,
      id: userId,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

