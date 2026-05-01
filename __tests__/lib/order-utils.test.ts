import { calculateOrderSummary, generateOrderNumber } from '@/lib/utils'

describe('Order Utilities', () => {
  describe('calculateOrderSummary', () => {
    it('calculates order summary without coupon', () => {
      const result = calculateOrderSummary({
        subtotal: 1000,
      })

      expect(result.subtotal).toBe(1000)
      expect(result.discount).toBe(0)
      expect(result.shipping).toBe(0) // Free shipping above 500
      expect(result.tax).toBeCloseTo(70, 1) // 7% of subtotal
      expect(result.total).toBeCloseTo(1070, 1) // 1000 + 0 + 70
    })

    it('applies free shipping for orders above threshold', () => {
      const result = calculateOrderSummary({
        subtotal: 600, // Above 500 threshold
      })

      expect(result.shipping).toBe(0)
      expect(result.total).toBeCloseTo(642, 1) // 600 + 0 + 42 (7% tax)
    })

    it('applies percentage discount coupon', () => {
      const result = calculateOrderSummary({
        subtotal: 1000,
        coupon: {
          discountType: 'PERCENTAGE',
          discountValue: 10, // 10%
        },
      })

      expect(result.discount).toBe(100) // 10% of 1000
      expect(result.subtotal).toBe(1000)
      const afterDiscount = 900
      expect(result.tax).toBeCloseTo(63, 1) // 7% of 900
      expect(result.total).toBeCloseTo(963, 1) // 900 + 0 (free ship) + 63
    })

    it('applies fixed discount coupon', () => {
      const result = calculateOrderSummary({
        subtotal: 1000,
        coupon: {
          discountType: 'FIXED',
          discountValue: 100,
        },
      })

      expect(result.discount).toBe(100)
      expect(result.total).toBeCloseTo(963, 1) // 900 + 0 + 63
    })

    it('respects max discount limit', () => {
      const result = calculateOrderSummary({
        subtotal: 1000,
        coupon: {
          discountType: 'PERCENTAGE',
          discountValue: 50, // 50% would be 500
          maxDiscount: 200, // But capped at 200
        },
      })

      expect(result.discount).toBe(200) // Capped at maxDiscount
    })

    it('does not discount more than subtotal', () => {
      const result = calculateOrderSummary({
        subtotal: 100,
        coupon: {
          discountType: 'FIXED',
          discountValue: 200, // More than subtotal
        },
      })

      expect(result.discount).toBe(100) // Capped at subtotal
    })

    it('applies free shipping flag', () => {
      const result = calculateOrderSummary({
        subtotal: 100,
        shippingFree: true,
      })

      expect(result.shipping).toBe(0)
    })
  })

  describe('generateOrderNumber', () => {
    it('generates order number with correct format', () => {
      const orderNumber = generateOrderNumber()
      
      expect(orderNumber).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/)
    })

    it('generates unique order numbers', () => {
      const orderNumber1 = generateOrderNumber()
      const orderNumber2 = generateOrderNumber()
      
      expect(orderNumber1).not.toBe(orderNumber2)
    })
  })
})
