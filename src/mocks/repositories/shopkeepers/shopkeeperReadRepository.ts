import {
  Shopkeeper,
  ShopkeeperDelivery,
  ShopkeeperLedgerEntry,
  ShopkeeperPayment,
  ShopkeeperReturnRecord,
} from '@/types/shopkeepers'
import { mockStorage } from '../../storage/localStorageAdapter'
import { ledgerEngine } from '../ledgerEngine'

export class ShopkeeperReadRepository {
  public async listShopkeepers(search?: string): Promise<Shopkeeper[]> {
    const db = mockStorage.getDatabase()
    let list = [...db.shopkeepers]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.shopName.toLowerCase().includes(q) ||
          s.ownerName.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.marketName.toLowerCase().includes(q)
      )
    }
    return list
  }

  public async getShopkeeperById(id: string): Promise<Shopkeeper | null> {
    const db = mockStorage.getDatabase()
    return db.shopkeepers.find((s) => s.id === id) || null
  }

  public async getDeliveries(shopkeeperId: string): Promise<ShopkeeperDelivery[]> {
    const db = mockStorage.getDatabase()
    return db.shopkeeperDeliveries[shopkeeperId] || []
  }

  public async getPayments(shopkeeperId: string): Promise<ShopkeeperPayment[]> {
    const db = mockStorage.getDatabase()
    return db.shopkeeperPayments[shopkeeperId] || []
  }

  public async getReturns(shopkeeperId: string): Promise<ShopkeeperReturnRecord[]> {
    const db = mockStorage.getDatabase()
    return db.shopkeeperReturns[shopkeeperId] || []
  }

  public async getLedger(shopkeeperId: string): Promise<ShopkeeperLedgerEntry[]> {
    const db = mockStorage.getDatabase()
    const entries = ledgerEngine.getPartyLedger(db, 'shopkeeper', shopkeeperId)
    if (entries.length > 0) {
      return entries.map((e) => {
        let type: ShopkeeperLedgerEntry['type'] = 'adjustment'
        if (e.type === 'sale') type = 'delivery_credit'
        else if (e.type === 'payment') type = 'payment_received'
        else if (e.type === 'return') type = 'return_credit'

        return {
          id: e.id,
          date: e.date,
          type,
          reference: e.refId,
          description: e.note || `${e.type.toUpperCase()}: ${e.refId}`,
          debit: e.debit,
          credit: e.credit,
          balance: e.balanceAfter ?? e.balance ?? 0,
        }
      })
    }
    return db.shopkeeperLedger[shopkeeperId] || []
  }

  public async listAllDeliveries(): Promise<
    Array<ShopkeeperDelivery & { shopkeeperId: string; shopkeeperName: string; marketName: string }>
  > {
    const db = mockStorage.getDatabase()
    const all: Array<
      ShopkeeperDelivery & { shopkeeperId: string; shopkeeperName: string; marketName: string }
    > = []

    for (const sk of db.shopkeepers) {
      const deliveries = db.shopkeeperDeliveries[sk.id] || []
      for (const d of deliveries) {
        all.push({
          ...d,
          shopkeeperId: sk.id,
          shopkeeperName: sk.shopName,
          marketName: sk.marketName,
        })
      }
    }

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return all
  }

  public async getDeliveryById(
    deliveryId: string
  ): Promise<
    | (ShopkeeperDelivery & {
        shopkeeperId: string
        shopkeeperName: string
        marketName: string
        phone: string
        address: string
      })
    | null
  > {
    const db = mockStorage.getDatabase()
    for (const sk of db.shopkeepers) {
      const deliveries = db.shopkeeperDeliveries[sk.id] || []
      const found = deliveries.find((d) => d.id === deliveryId)
      if (found) {
        return {
          ...found,
          shopkeeperId: sk.id,
          shopkeeperName: sk.shopName,
          marketName: sk.marketName,
          phone: sk.phone,
          address: sk.address,
        }
      }
    }
    return null
  }

  public async listAllReturns(): Promise<
    Array<ShopkeeperReturnRecord & { shopkeeperId: string; shopkeeperName: string; marketName: string }>
  > {
    const db = mockStorage.getDatabase()
    const all: Array<
      ShopkeeperReturnRecord & { shopkeeperId: string; shopkeeperName: string; marketName: string }
    > = []

    for (const sk of db.shopkeepers) {
      const returns = db.shopkeeperReturns[sk.id] || []
      for (const r of returns) {
        all.push({
          ...r,
          shopkeeperId: sk.id,
          shopkeeperName: sk.shopName,
          marketName: sk.marketName,
        })
      }
    }

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return all
  }
}