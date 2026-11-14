import { describe, it, expect, beforeEach } from 'vitest'
import { mockStorage } from '../storage/localStorageAdapter'
import { employeesRepository } from './employeesRepository'

describe('employeesRepository', () => {
  beforeEach(() => {
    mockStorage.resetDatabase()
  })

  it('lists employees', async () => {
    const employees = await employeesRepository.listEmployees()
    expect(employees.length).toBeGreaterThan(0)
  })

  it('creates an employee and updates list', async () => {
    const created = await employeesRepository.createEmployee({
      name: 'Audit Operator',
      employeeCode: 'EMP-AUD-01',
      designation: 'Sewing Operator',
      phone: '01700000000',
      address: 'Factory Floor',
      joiningDate: '2025-01-01',
      compensationMethod: 'piece',
      ratePerPiece: 20,
      status: 'active',
    })

    expect(created.id).toBeTruthy()
    expect(created.currentPayableBalance).toBe(0)

    const found = await employeesRepository.getEmployeeById(created.id)
    expect(found?.name).toBe('Audit Operator')
  })
})