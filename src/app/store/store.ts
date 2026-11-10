import { combineReducers, configureStore } from '@reduxjs/toolkit'
import themeReducer from './slices/themeSlice'
import uiReducer from './slices/uiSlice'

export const rootReducer = combineReducers({
  theme: themeReducer,
  ui: uiReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
