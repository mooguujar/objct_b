import { Test, TestingModule } from '@nestjs/testing'
import { ContentService } from './content.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('ContentService', () => {
  let service: ContentService
  let prismaService: PrismaService

  const mockPrismaService = {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    postLike: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    postCollect: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<ContentService>(ContentService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getPostList', () => {
    it('should return paginated post list', async () => {
      const mockPosts = [
        {
          id: BigInt(1),
          title: 'Test Post',
          content: 'Test Content',
          userId: BigInt(1),
          user: {
            id: BigInt(1),
            nickname: 'Test User',
            avatar: null,
          },
        },
      ]

      mockPrismaService.post.count.mockResolvedValue(1)
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts)
      mockPrismaService.postLike.findMany.mockResolvedValue([])
      mockPrismaService.postCollect.findMany.mockResolvedValue([])

      const result = await service.getPostList({
        page: 1,
        pageSize: 20,
      })

      expect(result).toHaveProperty('list')
      expect(result).toHaveProperty('pagination')
      expect(result.list).toHaveLength(1)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.pageSize).toBe(20)
    })
  })
})

