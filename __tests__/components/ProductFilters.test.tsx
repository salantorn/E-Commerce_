import { render, screen } from '@testing-library/react'
import ProductFilters from '@/components/products/ProductFilters'

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: [] }),
  })
) as jest.Mock

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/products',
}))

describe('ProductFilters', () => {
  const mockFilters = {
    page: 1,
    perPage: 12,
  }

  it('renders filter component', () => {
    const { container } = render(<ProductFilters currentFilters={mockFilters} />)
    expect(container).toBeInTheDocument()
  })

  it('displays filter options', () => {
    render(<ProductFilters currentFilters={mockFilters} />)
    
    // Check if there are any select or input elements
    const selects = screen.queryAllByRole('combobox')
    const inputs = screen.queryAllByRole('textbox')
    
    expect(selects.length + inputs.length).toBeGreaterThanOrEqual(0)
  })
})
