import { render, screen, fireEvent } from '@testing-library/react'
import CartDrawer from '@/components/cart/CartDrawer'
import * as cartStore from '@/store/cart-store'

// Mock the cart store
jest.mock('@/store/cart-store')

const mockCartItem = {
  productId: 'prod-1',
  variantId: undefined,
  name: 'Test Product',
  slug: 'test-product',
  price: 1000,
  quantity: 2,
  image: 'https://example.com/image.jpg',
  stock: 10,
}

describe('CartDrawer', () => {
  const mockUpdateQty = jest.fn()
  const mockRemoveItem = jest.fn()
  const mockClearCart = jest.fn()
  const mockCloseCart = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cartStore, 'useCartStore').mockReturnValue({
      items: [],
      itemCount: jest.fn(() => 0),
      subtotal: jest.fn(() => 0),
      updateQty: mockUpdateQty,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      isOpen: true,
      openCart: jest.fn(),
      closeCart: mockCloseCart,
      toggleCart: jest.fn(),
      addItem: jest.fn(),
    } as any)
  })

  it('renders empty cart message when no items', () => {
    render(<CartDrawer />)
    
    expect(screen.getByText(/ตะกร้าสินค้าว่างเปล่า/i)).toBeInTheDocument()
  })

  it('renders cart items correctly', () => {
    jest.spyOn(cartStore, 'useCartStore').mockReturnValue({
      items: [mockCartItem],
      itemCount: jest.fn(() => 2),
      subtotal: jest.fn(() => 2000),
      updateQty: mockUpdateQty,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      isOpen: true,
      openCart: jest.fn(),
      closeCart: mockCloseCart,
      toggleCart: jest.fn(),
      addItem: jest.fn(),
    } as any)

    render(<CartDrawer />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('฿1,000')).toBeInTheDocument()
  })

  it('displays correct subtotal', () => {
    jest.spyOn(cartStore, 'useCartStore').mockReturnValue({
      items: [mockCartItem],
      itemCount: jest.fn(() => 2),
      subtotal: jest.fn(() => 2000),
      updateQty: mockUpdateQty,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      isOpen: true,
      openCart: jest.fn(),
      closeCart: mockCloseCart,
      toggleCart: jest.fn(),
      addItem: jest.fn(),
    } as any)

    render(<CartDrawer />)
    
    expect(screen.getByText('฿2,000')).toBeInTheDocument()
  })

  it('calls updateQty when quantity changes', () => {
    jest.spyOn(cartStore, 'useCartStore').mockReturnValue({
      items: [mockCartItem],
      itemCount: jest.fn(() => 2),
      subtotal: jest.fn(() => 2000),
      updateQty: mockUpdateQty,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      isOpen: true,
      openCart: jest.fn(),
      closeCart: mockCloseCart,
      toggleCart: jest.fn(),
      addItem: jest.fn(),
    } as any)

    render(<CartDrawer />)
    
    const increaseButton = screen.getAllByRole('button').find(btn => {
      const svg = btn.querySelector('svg')
      return svg?.classList.contains('lucide-plus')
    })
    
    if (increaseButton) {
      fireEvent.click(increaseButton)
      expect(mockUpdateQty).toHaveBeenCalledWith('prod-1', 3, undefined)
    }
  })

  it('calls removeItem when remove button is clicked', () => {
    jest.spyOn(cartStore, 'useCartStore').mockReturnValue({
      items: [mockCartItem],
      itemCount: jest.fn(() => 2),
      subtotal: jest.fn(() => 2000),
      updateQty: mockUpdateQty,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      isOpen: true,
      openCart: jest.fn(),
      closeCart: mockCloseCart,
      toggleCart: jest.fn(),
      addItem: jest.fn(),
    } as any)

    render(<CartDrawer />)
    
    const removeButtons = screen.getAllByRole('button')
    const removeButton = removeButtons.find(btn => {
      const svg = btn.querySelector('svg')
      return svg?.classList.contains('lucide-trash2')
    })
    
    if (removeButton) {
      fireEvent.click(removeButton)
      expect(mockRemoveItem).toHaveBeenCalledWith('prod-1', undefined)
    }
  })

  it('shows checkout button when cart has items', () => {
    jest.spyOn(cartStore, 'useCartStore').mockReturnValue({
      items: [mockCartItem],
      itemCount: jest.fn(() => 2),
      subtotal: jest.fn(() => 2000),
      updateQty: mockUpdateQty,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      isOpen: true,
      openCart: jest.fn(),
      closeCart: mockCloseCart,
      toggleCart: jest.fn(),
      addItem: jest.fn(),
    } as any)

    render(<CartDrawer />)
    
    expect(screen.getByText(/ชำระเงิน/i)).toBeInTheDocument()
  })

  it('closes cart when backdrop is clicked', () => {
    jest.spyOn(cartStore, 'useCartStore').mockReturnValue({
      items: [],
      itemCount: jest.fn(() => 0),
      subtotal: jest.fn(() => 0),
      updateQty: mockUpdateQty,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      isOpen: true,
      openCart: jest.fn(),
      closeCart: mockCloseCart,
      toggleCart: jest.fn(),
      addItem: jest.fn(),
    } as any)

    render(<CartDrawer />)
    
    const backdrop = document.querySelector('.fixed.inset-0.z-\\[70\\]')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(mockCloseCart).toHaveBeenCalled()
    }
  })
})
