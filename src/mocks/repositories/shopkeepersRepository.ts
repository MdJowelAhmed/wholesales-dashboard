import { ShopkeeperReadRepository } from './shopkeepers/shopkeeperReadRepository'
import { ShopkeeperWriteRepository } from './shopkeepers/shopkeeperWriteRepository'

export type {
  RecordDeliveryInput,
  SettleConsignmentItemInput,
  SettleConsignmentInput,
  RecordShopkeeperPaymentInput,
  RecordShopkeeperReturnInput,
} from './shopkeepers/shopkeeperInputTypes'

export class ShopkeepersRepository {
  private readonly readRepo = new ShopkeeperReadRepository()
  private readonly writeRepo = new ShopkeeperWriteRepository()

  public listShopkeepers = this.readRepo.listShopkeepers.bind(this.readRepo)
  public getShopkeeperById = this.readRepo.getShopkeeperById.bind(this.readRepo)
  public getDeliveries = this.readRepo.getDeliveries.bind(this.readRepo)
  public getPayments = this.readRepo.getPayments.bind(this.readRepo)
  public getReturns = this.readRepo.getReturns.bind(this.readRepo)
  public getLedger = this.readRepo.getLedger.bind(this.readRepo)
  public listAllDeliveries = this.readRepo.listAllDeliveries.bind(this.readRepo)
  public getDeliveryById = this.readRepo.getDeliveryById.bind(this.readRepo)
  public listAllReturns = this.readRepo.listAllReturns.bind(this.readRepo)

  public createShopkeeper = this.writeRepo.createShopkeeper.bind(this.writeRepo)
  public recordDelivery = this.writeRepo.recordDelivery.bind(this.writeRepo)
  public settleConsignment = this.writeRepo.settleConsignment.bind(this.writeRepo)
  public recordPayment = this.writeRepo.recordPayment.bind(this.writeRepo)
  public recordReturn = this.writeRepo.recordReturn.bind(this.writeRepo)
}

export const shopkeepersRepository = new ShopkeepersRepository()