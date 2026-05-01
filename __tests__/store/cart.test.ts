import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/store/cart-store'

const mockCartItem = {
  productId: 'prod-1',
  variantId: undefined,
  name: 'Test Product',
  slug: 'test-product',
  price: 1000,
  quantity: 1,
  image: 'https://example.com/image.jpg',
  stock: 10,
}

describe('useCartStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCartStore())
    act(() => {
      result.current.clearCart()
    })
  })

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCartStore())
    
    expect(result.current.items).toEqual([])
    expect(result.current.itemCount()).toBe(0)
    expect(result.current.subtotal()).toBe(0)
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem(mockCartItem)
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].productId).toBe('prod-1')
    expect(result.current.itemCount()).toBe(1)
  })

  it('increases quantity when adding existing item', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem(mockCartItem)
      result.current.addItem(mockCartItem)
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.itemCount()).toBe(2)
  })

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem(mockCartItem)
      result.current.updateQty('prod-1', 5, undefined)
    })
    
    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.itemCount()).toBe(5)
  })

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem(mockCartItem)
      result.current.removeItem('prod-1', undefined)
    })
    
    expect(result.current.items).toHaveLength(0)
    expect(result.current.itemCount()).toBe(0)
  })

  it('calculates subtotal correctly', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem(mockCartItem)
      result.current.addItem({ ...mockCartItem, productId: 'prod-2', price: 2000 })
    })
    
    expect(result.current.subtotal()).toBe(3000)
  })

  it('clears cart', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem(mockCartItem)
      result.current.clearCart()
    })
    
    expect(result.current.items).toHaveLength(0)
    expect(result.current.itemCount()).toBe(0)
    expect(result.current.subtotal()).toBe(0)
  })

  it('does not exceed stock limit', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem(mockCartItem)
      result.current.updateQty('prod-1', 15, undefined) // stock is 10
    })
    
    expect(result.current.items[0].quantity).toBe(10)
  })

  it('removes item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem(mockCartItem)
      result.current.updateQty('prod-1', 0, undefined)
    })
    
    expect(result.current.items).toHaveLength(0)
  })

  it('toggles cart open state', () => {
    const { result } = renderHook(() => useCartStore())
    
    expect(result.current.isOpen).toBe(false)
    
    act(() => {
      result.current.toggleCart()
    })
    
    expect(result.current.isOpen).toBe(true)
  })
})
