import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BusinessProfile {
  id: string
  name: string
  location: string
  currency: string
}

interface UIState {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  activeBusiness: BusinessProfile
  availableBusinesses: BusinessProfile[]
  notificationsCount: number
}

const defaultBusinesses: BusinessProfile[] = [
  {
    id: 'biz-1',
    name: 'Bengal Tex Garments Ltd.',
    location: 'Mirpur, Dhaka, Bangladesh',
    currency: 'BDT',
  },
  {
    id: 'biz-2',
    name: 'Padma Wholesale Apparel',
    location: 'Chittagong, Bangladesh',
    currency: 'BDT',
  },
]

const initialState: UIState = {
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  activeBusiness: defaultBusinesses[0],
  availableBusinesses: defaultBusinesses,
  notificationsCount: 4,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    setActiveBusiness: (state, action: PayloadAction<string>) => {
      const found = state.availableBusinesses.find((b) => b.id === action.payload)
      if (found) {
        state.activeBusiness = found
      }
    },
  },
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileMenu,
  setMobileMenuOpen,
  setActiveBusiness,
} = uiSlice.actions

export default uiSlice.reducer
