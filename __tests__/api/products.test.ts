import { ProductService } from '@/services/product.service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

import prisma from '@/lib/prisma'

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findMany', () => {
    it('fetches products with filters', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          price: 1000,
          stock: 10,
        },
      ]

      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(1)

      const result = await ProductService.findMany({
        page: 1,
        perPage: 12,
      })

      expect(result.items).toEqual(mockProducts)
      expect(result.total).toBe(1)
      expect(prisma.product.findMany).toHaveBeenCalled()
    })

    it('applies search filter', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.product.count as jest.Mock).mockResolvedValue(0)

      await ProductService.findMany({
        search: 'test',
        page: 1,
        perPage: 12,
      })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
            ]),
          }),
        })
      )
    })

    it('applies price range filter', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.product.count as jest.Mock).mockResolvedValue(0)

      await ProductService.findMany({
        minPrice: 100,
        maxPrice: 1000,
        page: 1,
        perPage: 12,
      })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: expect.objectContaining({
              gte: 100,
              lte: 1000,
            }),
          }),
        })
      )
    })

    it('applies category filter', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.product.count as jest.Mock).mockResolvedValue(0)

      await ProductService.findMany({
        categoryId: 'cat-1',
        page: 1,
        perPage: 12,
      })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1',
          }),
        })
      )
    })

    it('sorts by price ascending', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.product.count as jest.Mock).mockResolvedValue(0)

      await ProductService.findMany({
        sortBy: 'price_asc',
        page: 1,
        perPage: 12,
      })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      )
    })

    it('paginates results correctly', async () => {
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.product.count as jest.Mock).mockResolvedValue(0)

      await ProductService.findMany({
        page: 2,
        perPage: 10,
      })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      )
    })
  })

  describe('findById', () => {
    it('fetches product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        price: 1000,
      }

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct)

      const result = await ProductService.findById('1')

      expect(result).toEqual(mockProduct)
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      })
    })

    it('returns null for non-existent product', async () => {
      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await ProductService.findById('non-existent')

      expect(result).toBeNull()
    })
  })
})
