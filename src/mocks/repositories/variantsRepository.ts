import {
  CategoryItem,
  SizeItem,
  ColorItem,
  INITIAL_CATEGORY_ITEMS,
  INITIAL_SIZE_ITEMS,
  INITIAL_COLOR_ITEMS,
} from '@/types/variants'
import { generateId } from '@/lib/ids'
import { mockStorage } from '../storage/localStorageAdapter'
import { STORAGE_SCOPES } from '../storage/storageScopes'

const VARIANT_WRITE_SCOPES = [STORAGE_SCOPES.VARIANTS, STORAGE_SCOPES.PRODUCTS] as const

export class VariantsRepository {
  // --- CATEGORIES ---
  public async listCategories(): Promise<CategoryItem[]> {
    const db = mockStorage.getDatabase()
    if (!db.categoryItems || db.categoryItems.length === 0) {
      db.categoryItems = [...INITIAL_CATEGORY_ITEMS]
      mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    }
    return [...db.categoryItems]
  }

  public async listCategoryNames(): Promise<string[]> {
    const items = await this.listCategories()
    return items.map((c) => c.name)
  }

  public async createCategory(name: string, description?: string): Promise<CategoryItem> {
    const db = mockStorage.getDatabase()
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Category name is required')

    if (!db.categoryItems) db.categoryItems = [...INITIAL_CATEGORY_ITEMS]

    const newItem: CategoryItem = {
      id: generateId('cat'),
      name: trimmed,
      description: description?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    db.categoryItems = [...db.categoryItems, newItem]
    db.categories = db.categoryItems.map((c) => c.name)
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return newItem
  }

  public async updateCategory(
    id: string,
    name: string,
    description?: string
  ): Promise<CategoryItem> {
    const db = mockStorage.getDatabase()
    if (!db.categoryItems) db.categoryItems = [...INITIAL_CATEGORY_ITEMS]

    const index = db.categoryItems.findIndex((c) => c.id === id)
    if (index === -1) throw new Error(`Category not found: ${id}`)

    const updated: CategoryItem = {
      ...db.categoryItems[index],
      name: name.trim(),
      description: description?.trim() || undefined,
    }

    const nextList = [...db.categoryItems]
    nextList[index] = updated
    db.categoryItems = nextList
    db.categories = db.categoryItems.map((c) => c.name)
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return updated
  }

  public async deleteCategory(idOrName: string): Promise<boolean> {
    const db = mockStorage.getDatabase()
    if (!db.categoryItems) db.categoryItems = [...INITIAL_CATEGORY_ITEMS]

    const filtered = db.categoryItems.filter(
      (c) => c.id !== idOrName && c.name !== idOrName
    )
    if (filtered.length === db.categoryItems.length) return false

    db.categoryItems = filtered
    db.categories = filtered.map((c) => c.name)
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return true
  }

  // --- SIZES ---
  public async listSizes(): Promise<SizeItem[]> {
    const db = mockStorage.getDatabase()
    if (!db.sizeItems || db.sizeItems.length === 0) {
      db.sizeItems = [...INITIAL_SIZE_ITEMS]
      mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    }
    return [...db.sizeItems]
  }

  public async listSizeNames(): Promise<string[]> {
    const items = await this.listSizes()
    return items.map((s) => s.name)
  }

  public async createSize(name: string, description?: string): Promise<SizeItem> {
    const db = mockStorage.getDatabase()
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Size name is required')

    if (!db.sizeItems) db.sizeItems = [...INITIAL_SIZE_ITEMS]

    const newItem: SizeItem = {
      id: generateId('sz'),
      name: trimmed,
      description: description?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    db.sizeItems = [...db.sizeItems, newItem]
    db.productSizes = db.sizeItems.map((s) => s.name)
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return newItem
  }

  public async updateSize(
    id: string,
    name: string,
    description?: string
  ): Promise<SizeItem> {
    const db = mockStorage.getDatabase()
    if (!db.sizeItems) db.sizeItems = [...INITIAL_SIZE_ITEMS]

    const index = db.sizeItems.findIndex((s) => s.id === id)
    if (index === -1) throw new Error(`Size not found: ${id}`)

    const updated: SizeItem = {
      ...db.sizeItems[index],
      name: name.trim(),
      description: description?.trim() || undefined,
    }

    const nextList = [...db.sizeItems]
    nextList[index] = updated
    db.sizeItems = nextList
    db.productSizes = db.sizeItems.map((s) => s.name)
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return updated
  }

  public async deleteSize(idOrName: string): Promise<boolean> {
    const db = mockStorage.getDatabase()
    if (!db.sizeItems) db.sizeItems = [...INITIAL_SIZE_ITEMS]

    const filtered = db.sizeItems.filter(
      (s) => s.id !== idOrName && s.name !== idOrName
    )
    if (filtered.length === db.sizeItems.length) return false

    db.sizeItems = filtered
    db.productSizes = filtered.map((s) => s.name)
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return true
  }

  // --- COLORS ---
  public async listColors(): Promise<ColorItem[]> {
    const db = mockStorage.getDatabase()
    if (!db.colorItems || db.colorItems.length === 0) {
      db.colorItems = [...INITIAL_COLOR_ITEMS]
      mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    }
    return [...db.colorItems]
  }

  public async listColorNames(): Promise<string[]> {
    const items = await this.listColors()
    return items.map((c) => c.name)
  }

  public async createColor(name: string, hexCode?: string): Promise<ColorItem> {
    const db = mockStorage.getDatabase()
    const trimmedName = name.trim()
    if (!trimmedName) throw new Error('Color name is required')

    if (!db.colorItems) db.colorItems = [...INITIAL_COLOR_ITEMS]

    const newItem: ColorItem = {
      id: generateId('col'),
      name: trimmedName,
      hexCode: hexCode?.trim() || '#3b82f6',
      createdAt: new Date().toISOString(),
    }

    db.colorItems = [...db.colorItems, newItem]
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return newItem
  }

  public async updateColor(
    id: string,
    name: string,
    hexCode?: string
  ): Promise<ColorItem> {
    const db = mockStorage.getDatabase()
    if (!db.colorItems) db.colorItems = [...INITIAL_COLOR_ITEMS]

    const index = db.colorItems.findIndex((c) => c.id === id)
    if (index === -1) throw new Error(`Color not found: ${id}`)

    const updated: ColorItem = {
      ...db.colorItems[index],
      name: name.trim(),
      hexCode: hexCode?.trim() || db.colorItems[index].hexCode,
    }

    const nextList = [...db.colorItems]
    nextList[index] = updated
    db.colorItems = nextList
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return updated
  }

  public async deleteColor(idOrName: string): Promise<boolean> {
    const db = mockStorage.getDatabase()
    if (!db.colorItems) db.colorItems = [...INITIAL_COLOR_ITEMS]

    const filtered = db.colorItems.filter(
      (c) => c.id !== idOrName && c.name !== idOrName
    )
    if (filtered.length === db.colorItems.length) return false

    db.colorItems = filtered
    mockStorage.saveDatabase(db, [...VARIANT_WRITE_SCOPES])
    return true
  }
}

export const variantsRepository = new VariantsRepository()

