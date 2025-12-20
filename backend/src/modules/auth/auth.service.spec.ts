import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

describe('AuthService', () => {
  let service: AuthService
  let prismaService: PrismaService
  let jwtService: JwtService

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  }

  const mockJwtService = {
    sign: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    prismaService = module.get<PrismaService>(PrismaService)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('login', () => {
    it('should return user and token when credentials are valid', async () => {
      const mockUser = {
        id: BigInt(1),
        username: 'testuser',
        passwordHash: await bcrypt.hash('password123', 10),
        nickname: 'Test User',
        avatar: null,
      }

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)
      mockJwtService.sign.mockReturnValue('mock-jwt-token')

      const result = await service.login('testuser', 'password123')

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('token')
      expect(result.token).toBe('mock-jwt-token')
    })

    it('should throw error when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.login('testuser', 'password123')).rejects.toThrow()
    })

    it('should throw error when password is incorrect', async () => {
      const mockUser = {
        id: BigInt(1),
        username: 'testuser',
        passwordHash: await bcrypt.hash('password123', 10),
      }

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)

      await expect(service.login('testuser', 'wrongpassword')).rejects.toThrow()
    })
  })
})

