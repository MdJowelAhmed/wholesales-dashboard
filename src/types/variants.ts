export interface CategoryItem {
  id: string
  name: string
  description?: string
  createdAt?: string
}

export interface SizeItem {
  id: string
  name: string // e.g. "16-20", "22-26", "28-32", "34-38", "S", "M", "L"
  description?: string
  createdAt?: string
}

export interface ColorItem {
  id: string
  name: string // e.g. "Navy Blue", "Dark Indigo", "Maroon"
  hexCode: string // e.g. "#1e3a8a", "#0f172a", "#881337"
  createdAt?: string
}

export const INITIAL_CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'cat-1', name: "Kids' Wear", description: 'Children wholesale garment lots and size bundles' },
  { id: 'cat-2', name: "Girls' Wear", description: 'Party frocks, skirts and tops' },
  { id: 'cat-3', name: "Boys' Wear", description: 'Polo shirts, tees and cargo pants' },
  { id: 'cat-4', name: "Infants' Wear", description: 'Rompers, onesies and newborn cotton sets' },
  { id: 'cat-5', name: "Mens' Wear", description: 'Wholesale men shirts, t-shirts and denim' },
  { id: 'cat-6', name: "Womens' Wear", description: 'Kurtis, leggings and formal apparel' },
]

export const INITIAL_SIZE_ITEMS: SizeItem[] = [
  { id: 'sz-1', name: '16-20', description: 'Toddler standard series' },
  { id: 'sz-2', name: '22-26', description: 'Kids standard series' },
  { id: 'sz-3', name: '28-32', description: 'Junior standard series' },
  { id: 'sz-4', name: '34-38', description: 'Teen / Adult standard series' },
  { id: 'sz-5', name: '18', description: 'Single size 18' },
  { id: 'sz-6', name: '20', description: 'Single size 20' },
  { id: 'sz-7', name: '22', description: 'Single size 22' },
  { id: 'sz-8', name: '24', description: 'Single size 24' },
  { id: 'sz-9', name: 'S', description: 'Small' },
  { id: 'sz-10', name: 'M', description: 'Medium' },
  { id: 'sz-11', name: 'L', description: 'Large' },
  { id: 'sz-12', name: 'XL', description: 'Extra Large' },
  { id: 'sz-13', name: 'XXL', description: 'Double Extra Large' },
]

export const INITIAL_COLOR_ITEMS: ColorItem[] = [
  { id: 'col-1', name: 'Navy Blue', hexCode: '#1e3a8a' },
  { id: 'col-2', name: 'Dark Indigo', hexCode: '#1e293b' },
  { id: 'col-3', name: 'Maroon', hexCode: '#881337' },
  { id: 'col-4', name: 'Baby Pink', hexCode: '#f472b6' },
  { id: 'col-5', name: 'Peach', hexCode: '#fb923c' },
  { id: 'col-6', name: 'Milky White', hexCode: '#f8fafc' },
  { id: 'col-7', name: 'Pastel Yellow', hexCode: '#fde047' },
  { id: 'col-8', name: 'Jet Black', hexCode: '#0f172a' },
  { id: 'col-9', name: 'Olive Green', hexCode: '#3f6212' },
]

