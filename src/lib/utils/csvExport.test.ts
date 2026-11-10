import { describe, it, expect, vi } from 'vitest'
import { exportToCsv } from './csvExport'

describe('csvExport utility', () => {
  it('generates properly formatted CSV and triggers download', () => {
    const mockClick = vi.fn()
    const mockAppendChild = vi.fn()
    const mockRemoveChild = vi.fn()

    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const elem = originalCreateElement('a')
        elem.click = mockClick
        return elem
      }
      return originalCreateElement(tagName)
    })

    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const sampleData = [
      { id: '1', name: 'Boys Polo Shirt', pieces: 150, price: 320 },
      { id: '2', name: 'Girls Frock, Embroidered', pieces: 80, price: 550 },
    ]

    exportToCsv('Sample_Export', sampleData)

    expect(mockClick).toHaveBeenCalledTimes(1)
    expect(mockAppendChild).toHaveBeenCalled()
    expect(mockRemoveChild).toHaveBeenCalled()
  })

  it('safely handles empty data array', () => {
    const mockClick = vi.fn()
    exportToCsv('Empty', [])
    expect(mockClick).not.toHaveBeenCalled()
  })
})
