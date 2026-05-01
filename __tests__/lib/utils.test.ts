import { formatPrice, formatDate, cn } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats number to Thai Baht currency', () => {
    expect(formatPrice(1000)).toBe('฿1,000')
    expect(formatPrice(1234.56)).toBe('฿1,234.56')
    expect(formatPrice(0)).toBe('฿0')
  })

  it('handles string input', () => {
    expect(formatPrice('1000')).toBe('฿1,000')
    expect(formatPrice('1234.56')).toBe('฿1,234.56')
  })

  it('handles negative numbers', () => {
    expect(formatPrice(-1000)).toBe('-฿1,000')
  })
})

describe('formatDate', () => {
  it('formats date to Thai format', () => {
    const date = new Date('2024-01-15T10:30:00')
    const formatted = formatDate(date)
    expect(formatted).toContain('15')
    // Thai Buddhist calendar shows 2567 instead of 2024
    expect(formatted).toMatch(/256[0-9]|202[0-9]/)
  })

  it('handles string date input', () => {
    const formatted = formatDate('2024-01-15')
    expect(formatted).toBeTruthy()
  })
})

describe('cn (className utility)', () => {
  it('merges class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active')
  })

  it('handles Tailwind merge conflicts', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toContain('px-4')
    expect(result).toContain('py-1')
  })
})
