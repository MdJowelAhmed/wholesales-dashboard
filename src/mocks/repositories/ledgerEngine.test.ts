import { describe, it, expect } from 'vitest'
import { ledgerEngine } from './ledgerEngine'
import { getFreshSeedData, SeedDatabase } from '../seed'

describe('ledgerEngine', () => {
  it('appends ledger entry and updates customer running balance', () => {
    let db: SeedDatabase = getFreshSeedData()
    db.ledgerEntries = []

    const res1 = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'customer',
      partyId: 'cust-1',
      date: '2026-11-01',
      type: 'sale',
      refType: 'sale_invoice',
      refId: 'inv-1',
      debit: 1000,
      credit: 0,
      note: 'Invoice 1',
    })
    db = res1.db

    expect(res1.entry.balanceAfter).toBe(1000)
    expect(ledgerEngine.getPartyBalance(db, 'customer', 'cust-1')).toBe(1000)

    // Receive payment of 600
    const res2 = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'customer',
      partyId: 'cust-1',
      date: '2026-11-02',
      type: 'payment',
      refType: 'payment_receipt',
      refId: 'pay-1',
      debit: 0,
      credit: 600,
      note: 'Payment received',
    })
    db = res2.db

    expect(res2.entry.balanceAfter).toBe(400)
    expect(ledgerEngine.getPartyBalance(db, 'customer', 'cust-1')).toBe(400)
  })

  it('allows balance to go NEGATIVE when customer overpays or has advance credit', () => {
    let db: SeedDatabase = getFreshSeedData()
    db.ledgerEntries = []

    // Customer owes 500
    const res1 = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'shopkeeper',
      partyId: 'sk-1',
      date: '2026-11-01',
      type: 'sale',
      refType: 'delivery',
      refId: 'del-1',
      debit: 500,
      credit: 0,
    })
    db = res1.db
    expect(res1.entry.balanceAfter).toBe(500)

    // Customer pays 1200 (advance of 700)
    const res2 = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'shopkeeper',
      partyId: 'sk-1',
      date: '2026-11-02',
      type: 'payment',
      refType: 'payment',
      refId: 'pay-2',
      debit: 0,
      credit: 1200,
    })
    db = res2.db

    // Balance is negative (-700), never Math.max(0)
    expect(res2.entry.balanceAfter).toBe(-700)
    expect(ledgerEngine.getPartyBalance(db, 'shopkeeper', 'sk-1')).toBe(-700)
  })

  it('handles supplier and employee payable balances (credit increases, debit decreases)', () => {
    let db: SeedDatabase = getFreshSeedData()
    db.ledgerEntries = []

    // Employee earned 800 in work
    const res1 = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'employee',
      partyId: 'emp-1',
      date: '2026-11-01',
      type: 'work',
      refType: 'work_entry',
      refId: 'work-1',
      debit: 0,
      credit: 800,
    })
    db = res1.db
    expect(res1.entry.balanceAfter).toBe(800)

    // Employee given 1000 in salary/advance
    const res2 = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'employee',
      partyId: 'emp-1',
      date: '2026-11-05',
      type: 'salary',
      refType: 'salary_disbursement',
      refId: 'sal-1',
      debit: 1000,
      credit: 0,
    })
    db = res2.db

    // Balance is -200 (employee took advance, owes us work/money)
    expect(res2.entry.balanceAfter).toBe(-200)
    expect(ledgerEngine.getPartyBalance(db, 'employee', 'emp-1')).toBe(-200)
  })

  it('reverses an entry by swapping debit/credit and restoring previous balance', () => {
    let db: SeedDatabase = getFreshSeedData()
    db.ledgerEntries = []

    const res1 = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'customer',
      partyId: 'cust-1',
      date: '2026-11-01',
      type: 'sale',
      refType: 'sale_invoice',
      refId: 'inv-1',
      debit: 500,
      credit: 0,
    })
    db = res1.db

    // Wrong extra charge of 300
    const res2 = ledgerEngine.appendLedgerEntry(db, {
      partyType: 'customer',
      partyId: 'cust-1',
      date: '2026-11-02',
      type: 'sale',
      refType: 'sale_invoice',
      refId: 'inv-wrong',
      debit: 300,
      credit: 0,
    })
    db = res2.db
    expect(res2.entry.balanceAfter).toBe(800)

    // Reverse the mistake
    const res3 = ledgerEngine.reverseLedgerEntry(db, res2.entry.id, 'Entered by mistake')
    db = res3.db

    expect(res3.reversalEntry.type).toBe('reversal')
    expect(res3.reversalEntry.reversalOf).toBe(res2.entry.id)
    expect(res3.reversalEntry.debit).toBe(0)
    expect(res3.reversalEntry.credit).toBe(300)
    expect(res3.reversalEntry.balanceAfter).toBe(500)
    expect(ledgerEngine.getPartyBalance(db, 'customer', 'cust-1')).toBe(500)

    // Attempting to reverse again throws an error
    expect(() => {
      ledgerEngine.reverseLedgerEntry(db, res2.entry.id, 'Duplicate reversal')
    }).toThrow(/already been reversed/)
  })
})

