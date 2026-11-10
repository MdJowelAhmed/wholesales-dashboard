import { RawMaterial } from '@/types/rawMaterials'
import { mockStorage } from '../storage/localStorageAdapter'

export class RawMaterialsRepository {
  public async listRawMaterials(category?: string): Promise<RawMaterial[]> {
    const db = mockStorage.getDatabase()
    let list = [...db.materials]
    if (category && category !== 'all') {
      list = list.filter((m) => m.category === category)
    }
    return list
  }

  public async getRawMaterialById(id: string): Promise<RawMaterial | null> {
    const db = mockStorage.getDatabase()
    return db.materials.find((m) => m.id === id) || null
  }

  public async createRawMaterial(
    input: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RawMaterial> {
    const db = mockStorage.getDatabase()
    const newMaterial: RawMaterial = {
      ...input,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedDb = {
      ...db,
      materials: [...db.materials, newMaterial],
    }
    mockStorage.saveDatabase(updatedDb)
    return newMaterial
  }

  public async updateRawMaterial(
    id: string,
    updates: Partial<RawMaterial>
  ): Promise<RawMaterial | null> {
    const db = mockStorage.getDatabase()
    const index = db.materials.findIndex((m) => m.id === id)
    if (index === -1) return null

    const existing = db.materials[index]
    if (!existing) return null

    const updated: RawMaterial = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    const materials = [...db.materials]
    materials[index] = updated
    mockStorage.saveDatabase({ ...db, materials })
    return updated
  }
}

export const rawMaterialsRepository = new RawMaterialsRepository()

