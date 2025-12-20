import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, password, nickname, phone, email } = registerDto;

    // 检查用户名是否存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('用户名、手机号或邮箱已存在');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username,
        passwordHash,
        nickname,
        phone,
        email,
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        coinBalance: true,
      },
    });

    // 生成Token
    const tokens = this.generateTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { phone: username },
          { email: username },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('账户已被封禁或删除');
    }

    // 生成Token
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        coinBalance: user.coinBalance,
      },
      ...tokens,
      expiresIn: this.getExpiresIn(),
    };
  }

  async validateUser(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        coinBalance: true,
      },
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    return user;
  }

  generateTokens(userId: bigint) {
    const payload = { sub: userId.toString() };
    
    const token = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d',
    });

    return {
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const userId = BigInt(payload.sub);
      const user = await this.validateUser(userId);

      if (!user) {
        throw new UnauthorizedException('用户不存在或已被封禁');
      }

      return this.generateTokens(userId);
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  async forgotPassword(username: string, code?: string) {
    // 查找用户
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { phone: username },
          { email: username },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // TODO: 验证码验证逻辑（可选）
    // if (code) {
    //   // 验证验证码
    // }

    // 生成重置Token（有效期1小时）
    const resetToken = this.jwtService.sign(
      { sub: user.id.toString(), type: 'reset' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    // TODO: 发送重置密码邮件/短信
    // 这里应该发送包含resetToken的链接到用户邮箱或手机

    return {
      resetToken,
      message: '重置链接已发送',
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      // 验证重置Token
      const payload = this.jwtService.verify(resetToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'reset') {
        throw new UnauthorizedException('无效的重置令牌');
      }

      const userId = BigInt(payload.sub);

      // 验证用户是否存在
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 加密新密码
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      return {
        message: '密码重置成功',
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('重置令牌已过期');
      }
      throw new UnauthorizedException('无效的重置令牌');
    }
  }

  private getExpiresIn(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    // 简单解析，实际应用中可以使用更复杂的解析逻辑
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    }
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    }
    return 7 * 24 * 60 * 60; // 默认7天
  }
}
