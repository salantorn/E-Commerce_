import { OrderService } from '@/services/order.service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    coupon: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    product: {
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      order: {
        create: jest.fn(),
      },
      cart: {
        delete: jest.fn(),
      },
      coupon: {
        update: jest.fn(),
      },
      product: {
        updateMany: jest.fn(),
      },
    })),
  },
}))

import prisma from '@/lib/prisma'

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findByUser', () => {
    it('fetches orders for a user', async () => {
      const mockOrders = [
        {
          id: '1',
          userId: 'user-1',
          total: 1000,
          status: 'PENDING',
        },
      ]

      ;(prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders)
      ;(prisma.order.count as jest.Mock).mockResolvedValue(1)

      const result = await OrderService.findByUser('user-1')

      expect(result.items).toEqual(mockOrders)
      expect(result.total).toBe(1)
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        })
      )
    })

    it('sorts orders by creation date descending', async () => {
      ;(prisma.order.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.order.count as jest.Mock).mockResolvedValue(0)

      await OrderService.findByUser('user-1')

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('findById', () => {
    it('fetches order by id', async () => {
      const mockOrder = {
        id: '1',
        userId: 'user-1',
        total: 1000,
      }

      ;(prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder)

      const result = await OrderService.findById('1')

      expect(result).toEqual(mockOrder)
      expect(prisma.order.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      })
    })

    it('returns null for non-existent order', async () => {
      ;(prisma.order.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await OrderService.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('updateStatus', () => {
    it('updates order status', async () => {
      const mockOrder = {
        id: '1',
        status: 'SHIPPED',
        items: [],
      }

      ;(prisma.order.update as jest.Mock).mockResolvedValue(mockOrder)

      const result = await OrderService.updateStatus('1', 'SHIPPED', 'TRACK123')

      expect(result).toEqual(mockOrder)
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            status: 'SHIPPED',
            trackingNumber: 'TRACK123',
          }),
        })
      )
    })
  })
})
