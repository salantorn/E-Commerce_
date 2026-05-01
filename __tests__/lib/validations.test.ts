import {
  registerSchema,
  loginSchema,
  productSchema,
  addToCartSchema,
  addressSchema,
  reviewSchema,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects weak password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Different123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('productSchema', () => {
    it('validates correct product data', () => {
      const validData = {
        name: 'Test Product',
        description: 'A great product',
        price: 1000,
        stock: 10,
        categoryId: 'cat-123',
        isActive: true,
        isFeatured: false,
      }
      
      const result = productSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects negative price', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'A great product',
        price: -100,
        stock: 10,
        categoryId: 'cat-123',
      }
      
      const result = productSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects negative stock', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'A great product',
        price: 1000,
        stock: -5,
        categoryId: 'cat-123',
      }
      
      const result = productSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('addToCartSchema', () => {
    it('validates correct cart data', () => {
      const validData = {
        productId: 'prod-123',
        quantity: 2,
      }
      
      const result = addToCartSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects zero quantity', () => {
      const invalidData = {
        productId: 'prod-123',
        quantity: 0,
      }
      
      const result = addToCartSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects negative quantity', () => {
      const invalidData = {
        productId: 'prod-123',
        quantity: -1,
      }
      
      const result = addToCartSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('addressSchema', () => {
    it('validates correct address data', () => {
      const validData = {
        name: 'John Doe',
        phone: '0812345678',
        line1: '123 Main St',
        city: 'Bangkok',
        state: 'Bangkok',
        postalCode: '10110',
        country: 'TH',
        isDefault: false,
      }
      
      const result = addressSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid phone number', () => {
      const invalidData = {
        name: 'John Doe',
        phone: '123',
        line1: '123 Main St',
        city: 'Bangkok',
        state: 'Bangkok',
        postalCode: '10110',
      }
      
      const result = addressSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid postal code', () => {
      const invalidData = {
        name: 'John Doe',
        phone: '0812345678',
        line1: '123 Main St',
        city: 'Bangkok',
        state: 'Bangkok',
        postalCode: '123',
      }
      
      const result = addressSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('reviewSchema', () => {
    it('validates correct review data', () => {
      const validData = {
        productId: 'prod-123',
        rating: 5,
        title: 'Great product',
        body: 'I love this product!',
      }
      
      const result = reviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects rating below 1', () => {
      const invalidData = {
        productId: 'prod-123',
        rating: 0,
      }
      
      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects rating above 5', () => {
      const invalidData = {
        productId: 'prod-123',
        rating: 6,
      }
      
      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
