import { render, screen } from '@testing-library/react'
import Navbar from '@/components/layout/Navbar'
import * as nextAuth from 'next-auth/react'
import * as cartStore from '@/store/cart-store'

jest.mock('next-auth/react')
jest.mock('@/store/cart-store')

describe('Navbar', () => {
  beforeEach(() => {
    jest.spyOn(nextAuth, 'useSession').mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    jest.spyOn(cartStore, 'useCartStore').mockImplementation((selector: any) => {
      const state = {
        items: [],
        itemCount: jest.fn(() => 0),
        subtotal: jest.fn(() => 0),
        isOpen: false,
        openCart: jest.fn(),
        closeCart: jest.fn(),
        toggleCart: jest.fn(),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQty: jest.fn(),
        clearCart: jest.fn(),
        setLoading: jest.fn(),
        syncWithServer: jest.fn(),
      }
      return selector ? selector(state) : state
    })
  })

  it('renders navbar component', () => {
    const { container } = render(<Navbar />)
    expect(container).toBeInTheDocument()
  })

  it('shows cart icon', () => {
    render(<Navbar />)
    const cartButtons = screen.getAllByRole('button')
    const cartButton = cartButtons.find(btn => {
      const svg = btn.querySelector('svg')
      return svg?.classList.contains('lucide-shopping-cart')
    })
    expect(cartButton).toBeInTheDocument()
  })

  it('displays cart item count when items exist', () => {
    // Mock useCartStore to return itemCount as 2 when called as a selector
    jest.spyOn(cartStore, 'useCartStore').mockImplementation((selector: any) => {
      const state = {
        items: [{} as any, {} as any],
        itemCount: jest.fn(() => 2),
        subtotal: jest.fn(() => 1000),
        isOpen: false,
        openCart: jest.fn(),
        closeCart: jest.fn(),
        toggleCart: jest.fn(),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQty: jest.fn(),
        clearCart: jest.fn(),
        setLoading: jest.fn(),
        syncWithServer: jest.fn(),
      }
      return selector ? selector(state) : state
    })

    render(<Navbar />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
