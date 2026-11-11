import {
  Product,
  ProductVariant,
} from '@/types/products'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { variantsRepository } from './variantsRepository'

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
      id: generateId('prod'),
      createdAt: new Date().toISOString(),
    }
    db.products = [newProduct, ...db.products]
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
    const nextProducts = [...db.products]
    nextProducts[index] = updated
    db.products = nextProducts
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
      id: generateId('var'),
    }
    product.variants = [...product.variants, newVariant]
    mockStorage.saveDatabase(db)
    return product
  }

  public async listCategories(): Promise<string[]> {
    return variantsRepository.listCategoryNames()
  }

  public async addCategory(name: string): Promise<string[]> {
    await variantsRepository.createCategory(name)
    return variantsRepository.listCategoryNames()
  }

  public async deleteCategory(name: string): Promise<string[]> {
    await variantsRepository.deleteCategory(name)
    return variantsRepository.listCategoryNames()
  }

  public async listSizes(): Promise<string[]> {
    return variantsRepository.listSizeNames()
  }

  public async addSize(sizeName: string): Promise<string[]> {
    await variantsRepository.createSize(sizeName)
    return variantsRepository.listSizeNames()
  }

  public async deleteSize(sizeName: string): Promise<string[]> {
    await variantsRepository.deleteSize(sizeName)
    return variantsRepository.listSizeNames()
  }
}

export const productsRepository = new ProductsRepository()
