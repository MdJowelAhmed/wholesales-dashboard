import { getFreshSeedData, SeedDatabase } from '../seed'

const STORAGE_KEY = 'garments_saas_demo_db_v1'

class MockStorage {
  private db: SeedDatabase
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.db = this.loadFromStorage()
  }

  private loadFromStorage(): SeedDatabase {
    if (typeof window === 'undefined') {
      return getFreshSeedData()
    }
    try {
      const serialized = localStorage.getItem(STORAGE_KEY)
      if (!serialized) {
        const fresh = getFreshSeedData()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
        return fresh
      }
      const parsed = JSON.parse(serialized) as SeedDatabase
      if (parsed.version !== '1.0.0') {
        const fresh = getFreshSeedData()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
        return fresh
      }
      return parsed
    } catch {
      return getFreshSeedData()
    }
  }

  public getDatabase(): SeedDatabase {
    return this.db
  }

  public saveDatabase(updated: SeedDatabase): void {
    this.db = updated
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db))
      } catch (err) {
        console.error('Failed to save to localStorage', err)
      }
    }
    this.notify()
  }

  public resetDatabase(): void {
    const fresh = getFreshSeedData()
    this.saveDatabase(fresh)
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch (err) {
        console.error('Listener notification error:', err)
      }
    })
  }
}

export const mockStorage = new MockStorage()
