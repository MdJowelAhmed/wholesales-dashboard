# Project Coding Standards & Engineering Rules
# Aparajita ERP — Garments Manufacturing & Wholesale SaaS Dashboard

These rules are mandatory for all AI-assisted coding, modifications, and refactoring in this repository. Follow every guideline strictly on every prompt.

---

## 1. Architecture & Directory Boundaries

```
src/
├── app/                  # Application core (entry, layout, router, store, providers)
├── components/
│   ├── shared/           # Reusable domain-agnostic components (DataTable, PageHeader, StatusBadge, etc.)
│   └── ui/               # Base design system primitives (Radix UI / Tailwind: button, dialog, card, etc.)
├── features/             # Feature-driven modular architecture
│   └── [feature]/
│       ├── components/   # Dialogs, modals, tab panels, cards specific to this feature
│       ├── pages/        # Route page controllers ONLY (thin views, max 200 lines)
│       └── [feature].test.tsx # Page & component test suites
├── lib/
│   ├── calculations/     # Pure financial, production, and piece-rate calculation business logic
│   └── utils/            # General helpers (formatters, CSV export, cn)
├── mocks/
│   ├── data/             # Static initial seed data
│   ├── repositories/     # Data Access Layer / Repositories (CRUD, transactions, storage sync)
│   └── storage/          # Storage adapters (localStorageAdapter, pub-sub)
└── types/                # Canonical TypeScript domain types & interfaces
```

### Boundary Constraints:
- **Pages (`src/features/*/pages/`)**: Must act as thin orchestrators. They fetch data via repositories, coordinate state, and delegate UI rendering to components.
- **NEVER** write business logic, heavy calculations, or repetitive tables directly inside page components.
- **NEVER** bypass the repository layer. UI components must NEVER import `mockStorage` or mutate `mockStorage.getDatabase()` directly. All data operations must go through `src/mocks/repositories/*Repository.ts`.

---

## 2. Component Design & Modularity Standards

1. **File Size Limit**:
   - Single component files must NOT exceed **250 lines**.
   - If a file exceeds 250 lines, it must be decomposed into smaller subcomponents.
2. **Modal & Dialog Extraction**:
   - **Never** declare `<Dialog>` or modals inline inside page components.
   - Always extract each dialog into its own file inside `src/features/<feature>/components/<Action>Dialog.tsx`.
3. **Tab Panels Extraction**:
   - In multi-tab views (like Shopkeeper details or Reports), each tab content must be its own component:
     `src/features/<feature>/components/<TabName>Tab.tsx`.
4. **DRY & Shared Logic**:
   - Do not create duplicated dialogs for similar concepts across features (e.g. unified payment dialog vs 5 separate payment dialogs). Use unified components or reusable form sub-parts.
   - Always use `@/components/shared/StatusBadge` for statuses, `@/components/shared/CurrencyDisplay` (or `formatBDT`) for money, and `@/components/shared/StateFeedbacks` for loading/empty/error states.

---

## 3. Data Layer & Repository Pattern

1. **Repository as Gateway**:
   - Every entity must have a typed repository class in `src/mocks/repositories/<entity>Repository.ts`.
   - All repository methods must be `async` and return `Promise<T>` to ensure zero refactoring when swapping mocks for real REST/GraphQL APIs.
2. **Immutability & Storage Sync**:
   - Never mutate database arrays directly (`db.items.push(newItem)`). Always clone and update immutably:
     `db.items = [...db.items, newItem]`.
   - Update transactions must be atomic: if updating ledger entries and outstanding balance, update both in the same repository method call before saving to storage.
3. **Referential Integrity**:
   - When creating child records (payments, deliveries, payroll disbursements), always validate that the parent entity exists and update summary metrics (e.g. `totalPaid`, `outstandingBalance`, `currentStockPieces`) accordingly.

---

## 4. Form Handling & React 19 Standards

1. **Stack**: Always use `react-hook-form` with `zod` and `@hookform/resolvers/zod`.
2. **Performance (React 19 / Compiler Safe)**:
   - **DO NOT** use `const val = watch('field')` in the component render body, as it triggers re-renders on every keystroke of any field.
   - **DO** use `useWatch({ control, name: 'field' })` when a value is needed for conditional rendering or calculations.
3. **Purity**:
   - **DO NOT** call impure functions (`Date.now()`, `new Date().toISOString()`) directly in the component body or top-level defaultValues. Compute default timestamps in helper functions, `useMemo`, or inside submit handlers.
4. **Validation & Feedback**:
   - Define all Zod schemas outside the component.
   - Form inputs must display field errors via `errors[fieldName]?.message`.
   - Submit buttons must show loading spinners and be disabled during `isSubmitting`.
   - Always show user feedback using `toast.success(...)` or `toast.error(...)` from `sonner`.

---

## 5. Routing, Performance & Optimization

1. **Route-Level Code Splitting**:
   - All page components in `src/app/router/router.tsx` must be lazily loaded via `React.lazy()`:
     ```tsx
     const ProductsListPage = React.lazy(() =>
       import('@/features/products/pages/ProductsListPage').then(m => ({ default: m.ProductsListPage }))
     )
     ```
   - Wrap the router outlet in a `<React.Suspense fallback={<LoadingState />}>`.
2. **Error Boundary & 404 Route**:
   - Maintain an `ErrorBoundary` around route outlets to prevent blank-screen crashes.
   - Always include a catch-all route `{ path: '*', element: <NotFoundPage /> }`.
3. **Table & List Performance**:
   - In `DataTable`:
     - Numerical columns must be sorted numerically (`a - b`), not via `localeCompare`.
     - Whenever search term or filter changes, reset `currentPage` to 1.
     - For large lists (>100 items), implement pagination or virtual scrolling.
4. **Search Inputs**:
   - Debounce search filters by 250-300ms to avoid unnecessary filtering on every keystroke.

---

## 6. Financial & Calculation Standards

1. **Source of Truth**:
   - All monetary, wage, and production math must reside in `src/lib/calculations/financialCalculations.ts`.
   - NEVER invent ad-hoc formulas or inline percentage multipliers inside UI components (e.g. `grossRevenue * 0.45` is forbidden in UI; encapsulate it in business calculation functions).
2. **Precision**:
   - Always wrap financial results with `roundCurrency(amount)`.
   - All quantities must be normalized in integer pieces (`quantityPieces: number`).
   - Standard currency display must use `BDT` formatting: `৳ 1,25,000.00`.

---

## 7. TypeScript Strictness & Type Safety

1. **No Inline Ad-Hoc Types**:
   - Domain models, inputs, and payloads must be defined in `src/types/<feature>.ts`.
   - Never write inline unions like `status: 'paid' | 'pending'` across multiple files. Use shared types from `@/types/common` (`PaymentMethod`, `StatusType`, `PaginationParams`).
2. **Defensive Coding & Undefined Safety**:
   - Always guard array indexing (e.g. `items[0]`) and `.find()` results with optional chaining (`?.`) or default fallbacks.
   - Do NOT use `@ts-ignore` or `@ts-expect-error` to bypass property access checks. Refine types properly using type guards or generic constraints.
3. **Strict No-Any**:
   - `any` is strictly prohibited. Use `unknown` with type narrowing (`err instanceof Error`) for catch blocks.

---

## 8. Testing Standards

1. **Framework**: Vitest + `@testing-library/react` + `@testing-library/user-event`.
2. **Coverage Requirements**:
   - Every repository method must have unit tests verifying CRUD and calculation accuracy.
   - Every page component must test:
     - Initial data rendering (summary cards, tables, headers).
     - Filter/Search interactions.
     - Dialog opening/closing on button clicks.
     - Empty states when no data is returned.
3. **Test Helpers**: Always use `renderWithProviders(...)` from `@/test/helpers/test-utils` to wrap components in Router and Store providers.

