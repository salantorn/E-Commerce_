import { slugify, truncate, getDiscountPercentage } from '@/lib/utils'

describe('String Utilities', () => {
  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('handles special characters', () => {
      expect(slugify('Hello@World!')).toBe('hello-world')
    })

    it('removes leading and trailing dashes', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world')
    })

    it('handles multiple spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world')
    })

    it('handles empty string', () => {
      expect(slugify('')).toBe('')
    })
  })

  describe('truncate', () => {
    it('truncates long text', () => {
      const longText = 'a'.repeat(150)
      const result = truncate(longText, 100)
      
      expect(result.length).toBe(101) // 100 + ellipsis
      expect(result).toMatch(/…$/)
    })

    it('does not truncate short text', () => {
      const shortText = 'Hello World'
      expect(truncate(shortText, 100)).toBe(shortText)
    })

    it('uses default length of 100', () => {
      const longText = 'a'.repeat(150)
      const result = truncate(longText)
      
      expect(result.length).toBe(101)
    })
  })

  describe('getDiscountPercentage', () => {
    it('calculates discount percentage', () => {
      expect(getDiscountPercentage(800, 1000)).toBe(20)
    })

    it('returns 0 when no discount', () => {
      expect(getDiscountPercentage(1000, 1000)).toBe(0)
    })

    it('returns 0 when compare price is lower', () => {
      expect(getDiscountPercentage(1000, 800)).toBe(0)
    })

    it('returns 0 when compare price is not provided', () => {
      expect(getDiscountPercentage(1000, 0)).toBe(0)
    })

    it('rounds to nearest integer', () => {
      expect(getDiscountPercentage(667, 1000)).toBe(33)
    })
  })
})
