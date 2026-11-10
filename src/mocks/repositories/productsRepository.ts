import { Product, ProductVariant } from '@/types/products'
import { mockStorage } from '../storage/localStorageAdapter'

export interface ListProductsFilter {
  search?: string
  category?: string
  status?: 'active' | 'inactive'
}

export class ProductsRepository {
  public async listProducts(filter?: ListProductsFilter): Promise<Product[]> {
    const db = mockStorage.getDatabase()
    let list = [...db.products]

    if (filter?.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    if (filter?.category && filter.category !== 'all') {
      list = list.filter((p) => p.category === filter.category)
    }

    if (filter?.status) {
      list = list.filter((p) => p.status === filter.status)
    }

    return list
  }

  public async getProductById(id: string): Promise<Product | null> {
    const db = mockStorage.getDatabase()
    return db.products.find((p) => p.id === id) || null
  }

  public async createProduct(
    product: Omit<Product, 'id' | 'createdAt'>
  ): Promise<Product> {
    const db = mockStorage.getDatabase()
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    db.products.unshift(newProduct)
    mockStorage.saveDatabase(db)
    return newProduct
  }

  public async updateProduct(
    id: string,
    updates: Partial<Omit<Product, 'id' | 'createdAt'>>
  ): Promise<Product> {
    const db = mockStorage.getDatabase()
    const index = db.products.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error(`Product not found: ${id}`)
    }
    const updated: Product = {
      ...db.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    db.products[index] = updated
    mockStorage.saveDatabase(db)
    return updated
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const db = mockStorage.getDatabase()
    const filtered = db.products.filter((p) => p.id !== id)
    if (filtered.length === db.products.length) return false
    db.products = filtered
    mockStorage.saveDatabase(db)
    return true
  }

  public async addVariant(
    productId: string,
    variant: Omit<ProductVariant, 'id'>
  ): Promise<Product> {
    const db = mockStorage.getDatabase()
    const product = db.products.find((p) => p.id === productId)
    if (!product) throw new Error(`Product not found: ${productId}`)

    const newVariant: ProductVariant = {
      ...variant,
      id: `var-${Date.now()}`,
    }
    product.variants.push(newVariant)
    mockStorage.saveDatabase(db)
    return product
  }
}

export const productsRepository = new ProductsRepository()
