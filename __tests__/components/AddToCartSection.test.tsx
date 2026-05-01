import { render, screen, fireEvent } from '@testing-library/react'
import AddToCartSection from '@/components/products/AddToCartSection'
import * as cartStore from '@/store/cart-store'

jest.mock('@/store/cart-store')
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

describe('AddToCartSection', () => {
  const mockProduct = {
    id: 'prod-1',
    name: 'Test Product',
    slug: 'test-product',
    price: 1000,
    stock: 10,
    images: [{ url: 'https://example.com/image.jpg', isPrimary: true }],
    variants: [],
  } as any

  const mockAddItem = jest.fn()
  const mockOpenCart = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cartStore, 'useCartStore').mockImplementation((selector: any) => {
      const state = {
        addItem: mockAddItem,
        openCart: mockOpenCart,
      }
      return selector ? selector(state) : state
    })
  })

  it('renders add to cart button', () => {
    render(<AddToCartSection product={mockProduct} />)
    expect(screen.getByText(/หยิบใส่ตะกร้า/i)).toBeInTheDocument()
  })

  it('shows out of stock message when stock is 0', () => {
    render(<AddToCartSection product={{ ...mockProduct, stock: 0 }} />)
    expect(screen.getByText(/สินค้าหมด/i)).toBeInTheDocument()
  })

  it('displays quantity controls', () => {
    render(<AddToCartSection product={mockProduct} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('จำนวน')).toBeInTheDocument()
  })

  it('adds product to cart when button is clicked', () => {
    render(<AddToCartSection product={mockProduct} />)
    const addButton = screen.getByText(/หยิบใส่ตะกร้า/i)
    
    fireEvent.click(addButton)
    
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod-1',
        name: 'Test Product',
        price: 1000,
        quantity: 1,
      })
    )
    expect(mockOpenCart).toHaveBeenCalled()
  })

  it('increases quantity when plus button is clicked', () => {
    render(<AddToCartSection product={mockProduct} />)
    const plusButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-plus')
    )
    
    fireEvent.click(plusButton!)
    
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('decreases quantity when minus button is clicked', () => {
    render(<AddToCartSection product={mockProduct} />)
    const plusButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-plus')
    )
    const minusButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-minus')
    )
    
    // First increase to 2
    fireEvent.click(plusButton!)
    expect(screen.getByText('2')).toBeInTheDocument()
    
    // Then decrease back to 1
    fireEvent.click(minusButton!)
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
