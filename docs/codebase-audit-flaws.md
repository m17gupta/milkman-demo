# Milkman Codebase Audit — Flaws, Conflicts & Issues

> **Audit Date:** July 2, 2026  
> **Scope:** Full stack — API routes, data service, components, types, models, configuration  
> **Intent:** Document all problems without making code changes

---

## 1. TYPE & SCHEMA CONFLICTS

### 1.1 `LanguageOption` Type Mismatch

| File | Declaration | Missing |
|------|-------------|---------|
| `src/types/common.ts` | `type LanguageOption = "en" \| "hi"` | ❌ `"pa"` missing |
| `src/i18n/routing.ts` | `locales = ["en", "hi", "pa"]` | ✅ Includes `"pa"` |
| `src/app/api/customers/route.ts` | Zod schema: `z.enum(["en", "hi"])` | ❌ `"pa"` missing |
| `src/app/api/customers/[customerCode]/route.ts` | Zod schema: `z.enum(["en", "hi"])` | ❌ `"pa"` missing |
| `src/components/customers/customer-form.tsx` | Dropdown includes `<option value="pa">` | ✅ But type says `"en" \| "hi"` |

**Impact:** TypeScript type allows only `"en" \| "hi"` but the UI and routing support `"pa"`. API validation rejects Punjabi language selection.

---

### 1.2 `CustomerProfile` Model — Duplicate `area` & `areaName` Fields

```typescript
// src/models/customer-profile.ts
areaName: { type: String, required: true, trim: true },
area:     { type: String, trim: true },  // ⚠️ Redundant — same concept as areaName
```

The API create handler sets `area: area.name` and `areaName: area.name` to the same value. This duplication contradicts the plan doc's `CustomerProfileData` interface which only has `areaCode` and `areaName`.

**Impact:** Confusion about which field to read. Components check `areaName` but data inconsistencies could emerge.

---

### 1.3 Delivery Model Field Name Inconsistency

Two different field naming conventions are used across the delivery logic:

| Source | Field Names |
|--------|-------------|
| `POST /api/deliveries` | `defaultQuantity`, `actualQuantity`, `extraQuantity` |
| `PATCH /api/deliveries/[id]/status` | `baseQuantity`, `quantityDelivered`, `extraQuantity`, `finalQuantity` |
| `seed-demo.mjs` | `baseQuantity`, `quantityDelivered`, `extraQuantity`, `finalQuantity` |
| `PlainDelivery` type in `data-service.ts` | `defaultQuantity`, `actualQuantity`, `extraQuantity` |

**Impact:** The seed script writes deliveries with `baseQuantity`/`finalQuantity` but the delivery route reads `defaultQuantity`/`actualQuantity`. These might map to different MongoDB fields, causing data to be written but not read correctly.

---

### 1.4 `Area.name` Type Instability

The `Area` model defines `name` as an object:
```typescript
name: {
  en: { type: String, required: true },
  hi: { type: String, trim: true },
  pa: { type: String, trim: true },
}
```

But many components check `typeof area.name === "string"` because the API sometimes returns it as a string (when created via simple API calls). The seed script stores `{ en, hi, pa }` objects, but a string value could also be inserted.

**Impact:** Runtime type errors when `area.name.en` is accessed on a string value.

---

## 2. API & DATA LOGIC FLAWS

### 2.1 Inconsistent API Response Shapes

| Endpoint | Response Wrapper |
|----------|-----------------|
| `GET /api/customers` | `{ customers: [...] }` |
| `GET /api/customers/[customerCode]` | `{ customer: { ...profile, plan, exceptions } }` |
| `GET /api/areas` | `{ areas: [...] }` |
| `GET /api/products` | `{ products: [...] }` |
| `GET /api/vendors` | `{ vendors: [...] }` |
| `GET /api/payments` | `{ payments: [...] }` (no wrapper object) |
| `GET /api/purchases` | `{ purchases: [...] }` (no wrapper object) |
| `GET /api/milk-entries` | `{ entries: [...], summary: {...} }` |

**Impact:** Unpredictable field names. Components must know which shape each API returns.

---

### 2.2 `getCustomerDetailData()` Calls `getBaseData()` Twice

```typescript
// src/lib/data-service.ts
export async function getCustomerDetailData(identifier: string) {
  const customers = await getCustomerListData();  // ← calls getBaseData()
  // ...
  const base = await getBaseData();  // ← calls getBaseData() again!
  // ...
}
```

Even though `getCustomerListData()` already calls `getBaseData()` (which is cached with React `cache()`), the function then calls `getBaseData()` again. If the cache is scoped per-request, this works, but in a per-request scope the second call re-executes the full MongoDB query.

**Impact:** Redundant database queries on every customer detail page load.

---

### 2.3 `getReferenceDate()` Checks `DeliveryException` Instead of `Delivery`

```typescript
// src/lib/data-service.ts
const [latestDelivery, latestPayment, latestPurchase, latestMilkEntry] = await Promise.all([
  DeliveryException.findOne().sort({ date: -1 })...,  // ← named "latestDelivery" but queries DeliveryException!
  Payment.findOne().sort({ date: -1 })...,
  PurchaseEntry.findOne().sort({ date: -1 })...,
  MilkEntry.findOne().sort({ date: -1 })...,
]);
```

The variable is named `latestDelivery` but it queries `DeliveryException`, not `Delivery`. If there are deliveries but no exceptions, the function won't consider them.

**Impact:** Reference date could be wrong (falling back to `new Date()`) when only delivery records exist.

---

### 2.4 Vendor Summary Only Uses Milk Entries, Not Purchase Entries

`getVendorsData()` aggregates from `MilkEntry` only:
```typescript
const results = await MilkEntry.aggregate<VendorSummaryAggregate>([...]);
```

But vendor purchases are tracked in `PurchaseEntry`. So the vendor's "total purchase amount", "total paid", "unpaid amount" stats only reflect milk entry data, not full purchase ledger data.

**Impact:** Vendor financial summaries are incomplete.

---

### 2.5 `DELETE /api/deliveries` Accepts `customerCode` from Query, Not Body

```typescript
const customerCode = searchParams.get("customerCode");
```

This works but can be problematic if the customer code contains special URL characters. No URL encoding is performed.

---

## 3. FRONTEND COMPONENT ISSUES

### 3.1 Customer Form Language Dropdown Includes `"pa"` But Type Restricts to `"en" | "hi"`

```typescript
// CustomerFormProps
initialValues?: {
  preferredLanguage: "en" | "hi";  // ❌ "pa" not in type
}

// CustomerForm JSX
<option value="pa">{t("languagePunjabi")}</option>  // ✅ Rendered in UI
```

**Impact:** TypeScript error when `"pa"` is selected and passed as `initialValues`.

---

### 3.2 Customer Dashboard Uses Hardcoded Demo Data

`src/app/[locale]/(customer)/customer/dashboard/page.tsx` has hardcoded fallback values:
```typescript
const demoNames: Record<string, string> = { en: "Ritu", hi: "रितु", pa: "ਰਿਤੂ" };
const demoAreas: Record<string, string> = { en: "Landra", hi: "लांड्रा", pa: "ਲਾਂਡਰਾ" };
```

The `CustomerDashboardPage` is a client component that fetches `/api/auth/me` (which returns hardcoded data), then constructs a fake customer object with dummy quantities, billing amounts, and calendar data.

**Impact:** Customer dashboard never shows real data. The dummy calendar has 31 days for May 2026 hardcoded.

---

### 3.3 `AdminModal` Uses `createPortal` With SSR Concerns

```typescript
export function AdminModal({ isOpen, ... }) {
  const [mounted, setMounted] = useState(false);
  // ...
  if (!isOpen || !mounted) return null;
  return createPortal(<div>...</div>, document.body);
}
```

The `mounted` guard prevents SSR errors, but any server-rendered page that includes this component will have a hydration mismatch if `isOpen` is `true` during initial render.

---

### 3.4 `AreaSelectField` Has Hardcoded Fallback But API Data May Be Different

The component initially loads `defaultAreaMaster` from `@/lib/areas` but tries to fetch from API. If API returns areas with active/inactive status, the dropdown may show outdated data.

---

### 3.5 `PaymentEntryForm` Is Defined But Not Used

`src/components/billing/payment-entry-form.tsx` is a standalone payment form component. However, the billing dashboard uses `BillingManagement` which has its own payment modal. The standalone form appears to be orphaned.

---

### 3.6 Customer List Status Filter Only Has "All" / "Active" / "Paused"

```typescript
<option value="ALL">All Status</option>
<option value="ACTIVE">Active</option>
<option value="PAUSED">Paused</option>
```

**Missing:** `"INACTIVE"` filter option, even though the status value exists in the data.

---

### 3.7 `getDayStatus` in `CustomerDetailModal` Uses Naive Date Matching

```typescript
const getDayStatus = (dayNum: number) => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${dayNum}`;
  const log = logs.find(l => {
    if (l.date) return l.date.includes(dateStr);
    return l.dateLabel.startsWith(String(dayNum).padStart(2, '0'));
  });
  return log?.status.toLowerCase() || "pending";
};
```

This logic always uses the **current month** regardless of which month is being viewed, and the month string "April" won't match "May". This makes the schedule view calendar unreliable.

---

## 4. AUTHENTICATION & SECURITY

### 4.1 Full Auth Bypass

| File | Issue |
|------|-------|
| `src/lib/auth.ts` | All functions return hardcoded values |
| `src/app/api/auth/me/route.ts` | Returns static admin user response |
| `src/proxy.ts` | "Auth checks removed to allow direct access to all pages" |

**Impact:** No authentication, authorization, or session management. Anyone can access any route.

### 4.2 No CSRF or Input Sanitization

API endpoints accept raw JSON with no CSRF protection or request origin validation.

### 4.3 No Rate Limiting

All API endpoints are unprotected against abuse.

---

## 5. CONFIGURATION & BUILD ISSUES

### 5.1 Next.js / ESLint Version Mismatch

| Package | Installed Version |
|---------|------------------|
| `next` | `^15.5.15` |
| `eslint-config-next` | `16.2.3` |

ESLint config from Next.js 16 may use APIs not compatible with Next.js 15.

### 5.2 `AGENTS.md` References Wrong Next.js Version

```
This is NOT the Next.js you know
Read the relevant guide in `node_modules/next/dist/docs/`
```

The project is on Next.js 15 (stable), not a new/breaking version. The warning may be misleading for developers.

### 5.3 Persistent TypeScript Errors

Files `ts_errors.txt` and `ts_errors_2.txt` exist in the project root, listing unresolved TypeScript errors. This indicates the project has known type issues that haven't been addressed.

---

## 6. CSS & DESIGN CONFLICTS

### 6.1 `!important` Overrides in `globals.css`

```css
:root {
  --brand: #064e3b !important;
  --brand-soft: #f0fdf4 !important;
  --brand-ink: #042f24 !important;
  --bg: #f1f5f9 !important;
  --surface: #ffffff !important;
  --border: #e2e8f0 !important;
  --admin-primary: var(--brand) !important;
  /* ... */
}
```

These override previously defined CSS custom properties at the `:root` level using `!important`. This suggests two design systems were merged and the newer one forcibly takes precedence.

### 6.2 Body Background Gradients May Be Overridden

```css
body {
  background:
    radial-gradient(...),
    radial-gradient(...),
    var(--bg);
}

/* But then in :root */
body, html {
  background: var(--bg) !important;
}
```

The second rule neutralizes the gradient backgrounds set on `body`.

---

## 7. ORPHANED / UNUSED CODE

### 7.1 Unused Constants

- `DELIVERY_STATUS` in `src/lib/constants.ts` — never imported
- `USER_ROLES` in `src/lib/constants.ts` — never imported
- `PaymentEntryForm` component — appears unused
- `demo-data.ts` — full demo data module no longer referenced by any page
- `MetricCard` component — exported but appears unused

### 7.2 `demo-data.ts` Not Used Anywhere

The `src/lib/demo-data.ts` file has comprehensive demo customer/delivery/payment data and calendar insights functions, but these are not referenced by any current page or API route. The real data flows through `data-service.ts`.

---

## 8. EDGE CASES & POTENTIAL RUNTIME BUGS

### 8.1 `/` (Root) Page Handles Locale Manually

`src/app/page.tsx` hardcodes links to `/en/admin/dashboard`, `/hi/customer/dashboard`, and `/en/login` instead of dynamically using the user's locale or a redirect. This breaks locale detection.

### 8.2 No Loading/Error Boundaries on Server Components Key Pages

Most admin pages are async server components that call `getCustomerListData()`, `getDashboardData()`, etc. If any database query fails, the entire page crashes with no error UI.

### 8.3 `DashboardRedirect` Uses `localStorage` Directly

```typescript
const userStr = localStorage.getItem("user");
```

This only runs client-side (inside `useEffect`), but the pattern is fragile — no parsing error handling, no type checking.

### 8.4 Payments GET Returns All Payments Without Date Range

```typescript
// src/app/api/payments/route.ts
const payments = await Payment.find().sort({ date: -1, createdAt: -1 }).lean();
```

This returns ALL payments across all time, with no pagination or date filtering. On a large dataset, this could be a performance issue.

### 8.5 Customer Calendar `/calendar` Route Has No Customer Auth Check

The route `GET /api/customers/[customerCode]/calendar` accepts any `customerCode` and returns their data without authentication.

---

## 9. I18N & LOCALIZATION CONCERNS

### 9.1 Inconsistent Punjabi Support

While `"pa"` locale is fully set up in routing, many places don't support it:
- `LanguageOption` type (needs `"pa"`)
- Customer API schemas (needs `"pa"`)
- `PAYMENT_MODE` enum format — hardcoded string `"UPI"` etc. (not a locale issue but worth noting)

### 9.2 `en.json` Contains Many Empty Translation Strings

```json
"admin.shell.liveMode": "",
"admin.customers.liveCreateFlow": "",
"admin.areas.confirmDelete": "Delete area {code}? ...",
```

Some translations reference `{code}` in the message (area delete confirm) which is properly interpolated, but many namespace entries are empty strings.

---

## 10. SUMMARY TABLE (Count)

| Category | Count | Severity |
|----------|-------|----------|
| Type/Schema conflicts | 4 | High |
| API/Data logic flaws | 5 | High |
| Frontend component issues | 7 | Medium |
| Auth/Security | 3 | Critical |
| Config/Build | 3 | Medium |
| CSS/Design | 2 | Low |
| Orphaned code | 5 | Low |
| Edge case bugs | 5 | Medium |
| i18n concerns | 2 | Medium |
| **Total** | **36** | |

---

## 11. PRIORITY RECOMMENDATIONS

1. **🔴 Critical:** Add `"pa"` to all type definitions and Zod validation schemas
2. **🔴 Critical:** Implement real authentication or document the bypass clearly
3. **🔴 Critical:** Fix delivery field name inconsistency — align `POST /api/deliveries` with `seed-demo.mjs` field names
4. **🟠 High:** Fix `getReferenceDate()` to query `Delivery` collection, not just `DeliveryException`
5. **🟠 High:** Align vendor summary to use `PurchaseEntry` data, not just `MilkEntry`
6. **🟠 High:** Remove duplicate `area` field from `CustomerProfile` model
7. **🟡 Medium:** Remove unused `PaymentEntryForm`, `demo-data.ts`, unused constants
8. **🟡 Medium:** Add error boundaries to server component pages
9. **🟡 Medium:** Add pagination to `GET /api/payments`
10. **🟢 Low:** Resolve CSS `!important` conflicts and clean up design tokens
