# ESLint Fixes TODO

## Errors (35+)
### Unescaped Entities
- src/app/admin/dashboard/page.tsx: lines 74 - replace ' with &apos;
- src/app/admin/menu/page.tsx: line 210 - replace " with "
- src/app/admin/reports/page.tsx: line 71 - replace ' with &apos;

### Unexpected any
- src/app/api/auth/me/route.ts: line 21 - specify type instead of any
- src/app/api/health/route.ts: line 41 - specify type instead of any
- src/app/api/menu/route.ts: line 28 - specify type instead of any
- src/app/api/orders/route.ts: line 36 - specify type instead of any
- src/app/api/restaurants/route.ts: line 27 - specify type instead of any
- src/app/api/tables/route.ts: line 25 - specify type instead of any
- src/app/register/page.tsx: lines 74, 76 - specify types instead of any
- src/context/app-context.tsx: lines 137, 197, 310, 329, 344, 380, 398, 416 - specify types instead of any
- src/lib/auth.ts: lines 36, 66 - specify types instead of any
- src/lib/change-streams.ts: lines 7,8,9,95,107,119 - specify types instead of any
- src/lib/mongodb-services.ts: line 61 - specify type instead of any
- src/lib/services/user-service.ts: line 39 - specify type instead of any

### Prefer const
- src/app/api/menu/route.ts: line 28 - change let to const
- src/app/api/orders/route.ts: line 36 - change let to const
- src/app/api/restaurants/route.ts: line 27 - change let to const
- src/app/api/tables/route.ts: line 25 - change let to const

## Warnings (Unused vars, etc.)
- [x] src/app/admin/layout.tsx: remove unused DropdownMenuItem
- src/app/admin/orders/page.tsx: remove unused PageHeader, paymentMethod
- src/app/admin/reports/page.tsx: remove unused PageHeader, OrderStatus
- src/app/admin/tables/page.tsx: remove unused PageHeader
- src/app/api/auth/logout/route.ts: remove unused request
- src/app/api/auth/register/route.ts: remove unused hashPassword
- src/app/api/health/route.ts: remove unused request
- src/app/api/menu/route.ts: remove unused authenticateUser
- src/app/api/orders/route.ts: remove unused authenticateUser
- src/app/api/restaurants/route.ts: remove unused authenticateUser
- src/app/api/tables/route.ts: remove unused authenticateUser
- src/app/menu/[restaurantId]/[tableId]/page.tsx: remove unused Filter
- src/app/order/[restaurantId]/[orderId]/page.tsx: remove unused Loader
- src/app/page.tsx: remove unused Label
- src/app/register/page.tsx: remove unused data
- src/context/app-context.tsx: remove unused OrderItem, AppData; fix useCallback deps
- src/hooks/use-toast.ts: remove unused actionTypes
- src/lib/auth.ts: remove unused SignOptions, error
- src/lib/change-streams.ts: remove unused change vars
- src/lib/services/user-service.ts: remove unused error

## Progress
- [ ] Fix unescaped entities
- [ ] Fix any types
- [ ] Fix prefer const
- [ ] Remove unused vars
- [ ] Fix hooks deps
