import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/products/ProductCard'

const mockProduct = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  price: 1000,
  comparePrice: 1500,
  images: [{ id: '1', url: 'https://example.com/image.jpg', productId: '1' }],
  stock: 10,
  rating: 4.5,
  reviewCount: 10,
  isFeatured: true,
  isActive: true,
  category: {
    id: '1',
    name: 'Test Category',
    slug: 'test-category',
  },
}

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })

  it('displays discount badge when comparePrice is higher', () => {
    render(<ProductCard product={mockProduct} />)
    
    const discount = Math.round(((1500 - 1000) / 1500) * 100)
    expect(screen.getByText(`-${discount}%`)).toBeInTheDocument()
  })

  it('shows out of stock badge when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    
    expect(screen.getByText('สินค้าหมด')).toBeInTheDocument()
  })

  it('displays rating when available', () => {
    render(<ProductCard product={mockProduct} />)
    
    // Rating is displayed as "4.5 (10)" in a single span
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
    expect(screen.getByText(/\(10\)/)).toBeInTheDocument()
  })

  it('renders product image', () => {
    render(<ProductCard product={mockProduct} />)
    
    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('image.jpg'))
  })
})
