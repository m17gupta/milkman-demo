# Milkman React Native Mobile App — Implementation Plan

## Overview

A React Native companion mobile app that mirrors the existing Next.js web app, consuming the **same API endpoints** and implementing **all the same features**. Two app variants: **Admin App** (vendor/milkman operations) and **Customer App** (self-service portal), or a single app with role-based routing.

---

## Tech Stack

| Category              | Recommendation                         |
| --------------------- | -------------------------------------- |
| Framework             | React Native (Expo SDK 52+)            |
| Language              | TypeScript                             |
| Navigation            | Expo Router v4 (file-based routing)    |
| State Management      | React Query (TanStack Query) + Zustand |
| HTTP Client           | Axios or fetch wrapper                 |
| Forms                 | React Hook Form + Zod                  |
| UI Framework          | NativeWind (Tailwind for RN)           |
| Icons                 | Lucide React Native / Expo Icons       |
| Date/Calendar         | date-fns + react-native-calendars      |
| Localization          | i18next + react-i18next                |
| Charts                | react-native-chart-kit / victory-native|
| Storage               | expo-secure-store (tokens) + AsyncStorage |
| Maps (optional)       | react-native-maps (area delivery view) |
| Notifications (later) | expo-notifications / Firebase Cloud Messaging |

---

## API Base URL Configuration

```
API_BASE_URL = https://<production-domain>/api
```

All API calls use this base + endpoint path. Auth token passed via `Authorization: Bearer <token>` header (when real auth is implemented; currently bypassed).

---

## Shared Types (Mirror Web Types)

```typescript
// === Common ===
type StatusOption = "ACTIVE" | "INACTIVE";
type LanguageOption = "en" | "hi" | "pa";

// === Auth ===
type UserRole = "ADMIN" | "CUSTOMER";

interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
  preferredLanguage?: LanguageOption;
}

interface AuthResponse {
  success: boolean;
  user: AuthUser;
  profile?: CustomerProfileData;
  area?: AreaData;
}

// === Area ===
interface AreaData {
  _id: string;
  code: string;
  name: { en: string; hi?: string; pa?: string };
  isActive?: boolean;
  sortOrder?: number;
}

// === Customer ===
interface CustomerProfileData {
  _id: string;
  userId: string;
  customerCode: string;
  addressLine1: string;
  addressLine2?: string;
  areaCode: string;
  areaName: string;
  landmark?: string;
  notes?: string;
  deliveryInstruction?: string;
  isActive?: boolean;
}

interface CustomerWithPlan extends CustomerProfileData {
  plan?: MilkPlanData;
  exceptions?: DeliveryExceptionData[];
  user?: { name: string; phone: string; preferredLanguage?: string; status?: string };
}

interface CustomerFormData {
  name: string;
  phone: string;
  preferredLanguage?: LanguageOption;
  addressLine1: string;
  addressLine2?: string;
  areaCode: string;
  landmark?: string;
  notes?: string;
  deliveryInstruction?: string;
  quantityLiters: number;
  pricePerLiter: number;
  unitLabel?: string;
  status?: StatusOption;
}

// === Milk Plan ===
interface MilkPlanData {
  _id: string;
  customerId: string;
  quantityLiters: number;
  pricePerLiter: number;
  unitLabel?: string;
  isActive?: boolean;
  startDate: string;
  endDate?: string;
}

// === Delivery ===
type DeliveryStatus = "DELIVERED" | "SKIPPED" | "PAUSED";
type CalendarStatus = "DELIVERED" | "SKIPPED" | "PAUSED" | "PENDING";
type DeliveryRunStatus = "ALL" | "DELIVERED" | "SKIPPED" | "PAUSED" | "PENDING";

interface DeliveryData {
  _id: string;
  customerId: string;
  date: string;
  defaultQuantity: number;
  actualQuantity: number;
  extraQuantity?: number;
  pricePerLiter?: number;
  status: DeliveryStatus;
  note?: string;
  items?: DeliveryAddOnItem[];
}

interface DeliveryAddOnItem {
  productCode?: string;
  productName?: string;
  quantity?: number;
  rate?: number;
  totalAmount?: number;
}

interface DeliveryEntry {
  customer: CustomerProfileData & { name?: string; phone?: string };
  plan?: MilkPlanData;
  status: CalendarStatus;
  delivery?: DeliveryData;
  exception?: DeliveryExceptionData;
}

interface DeliveryRunResponse {
  entries: DeliveryEntry[];
  counts: {
    delivered: number;
    skipped: number;
    paused: number;
    pending: number;
  };
}

interface DeliveryFormData {
  customerCode: string;
  status: DeliveryStatus;
  actualQuantity?: number;
  extraQuantity?: number;
  note?: string;
  date?: string;
}

// === Delivery Exception ===
interface DeliveryExceptionData {
  _id: string;
  customerId: string;
  date: string;
  type: "SKIP" | "PAUSE";
}

// === Payment ===
type PaymentMode = "CASH" | "UPI" | "BANK";

interface PaymentData {
  _id: string;
  customerId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  note?: string;
}

interface PaymentFormData {
  customerCode: string;
  amount: number;
  mode: PaymentMode;
  note?: string;
  date?: string;
}

// === Calendar ===
interface CalendarDayRecord {
  dateKey: string;
  dateLabel: string;
  dayOfMonth: number;
  weekdayLabel: string;
  liters: number;
  status: CalendarStatus;
  deliveredCount?: number;
  pausedCount?: number;
  skippedCount?: number;
  itemCount?: number;
  isFuture?: boolean;
}

// === Product ===
interface ProductData {
  _id: string;
  code: string;
  name: string;
  category: "MILK" | "DAIRY_ADDON" | "OTHER";
  unit: string;
  defaultRate: number;
  isActive?: boolean;
  sortOrder?: number;
}

// === Vendor ===
interface VendorData {
  _id: string;
  code: string;
  name: string;
  phone?: string;
  defaultRate?: number;
  areaCode?: string;
  areaName?: string;
  notes?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// === Milk Entry (Vendor Inflow) ===
interface MilkEntryData {
  _id: string;
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  date: string;
  quantity: number;
  rate: number;
  total: number;
  status: "PAID" | "UNPAID";
}

// === Purchase Entry ===
interface PurchaseEntryData {
  _id: string;
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  productId: string;
  productCode: string;
  productName: string;
  productCategory: string;
  unit: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  date: string;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  note?: string;
}

// === Dashboard Stats ===
interface AdminDashboardStats {
  activeCustomers: number;
  todayDeliveries: number;
  monthlySales: number;
  outstandingDues: number;
  deliveryCompletionRate: number;
  paymentRecoveryRate: number;
  collectionRate: number;
  milkInwardTotal: number;
  milkInwardUnpaid: number;
  milkInwardCoverage: number;
  topArea?: { code: string; name: string; total: number };
}

interface CustomerDashboardData {
  profile: CustomerProfileData;
  plan: MilkPlanData;
  monthlyBilled: number;
  monthlyPaid: number;
  monthlyDue: number;
  upcomingExceptions?: DeliveryExceptionData[];
  recentDeliveries?: CalendarDayRecord[];
}

// === Billing ===
interface BillingSummary {
  totalBilled: number;
  totalPaid: number;
  totalDue: number;
  records: Array<{
    customerCode: string;
    customerName: string;
    areaName: string;
    quantity: number;
    rate: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    monthKey: string;
  }>;
}

interface BillSummaryData {
  _id: string;
  customerId: string;
  monthKey: string;
  totalQuantity: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}
```

---

## API Endpoints Summary (to be consumed by RN)

### Authentication
| Method | Endpoint          | Description          | Request Body | Response |
| ------ | ----------------- | -------------------- | ------------ | -------- |
| GET    | `/api/auth/me`    | Get current user     | —            | `AuthResponse` |
| POST   | `/api/auth/login` | Login (future impl)  | `{ phone }`  | `AuthResponse` |

### Areas
| Method | Endpoint                | Description      | Request Body | Response |
| ------ | ----------------------- | ---------------- | ------------ | -------- |
| GET    | `/api/areas`            | List all areas   | —            | `{ areas: AreaData[] }` |
| POST   | `/api/areas`            | Create area      | `{ code?, name, isActive? }` | `AreaData` |
| GET    | `/api/areas/[code]`     | Get area by code | —            | `AreaData` |
| PUT    | `/api/areas/[code]`     | Update area      | `{ code?, name, isActive? }` | `AreaData` |
| DELETE | `/api/areas/[code]`     | Delete area      | —            | `{ success: true }` |

### Customers
| Method | Endpoint                                      | Description                  | Request Body | Response |
| ------ | --------------------------------------------- | ---------------------------- | ------------ | -------- |
| GET    | `/api/customers`                              | List all customers           | —            | `{ customers: CustomerProfileData[] }` |
| POST   | `/api/customers`                              | Create customer + user + plan| `CustomerFormData` | `{ user, profile, plan }` |
| GET    | `/api/customers/[customerCode]`               | Get customer detail          | —            | `{ customer: CustomerWithPlan }` |
| PUT    | `/api/customers/[customerCode]`               | Update customer              | `CustomerFormData` | `{ user, profile, plan }` |
| PATCH  | `/api/customers/[customerCode]/quantity`      | Update plan quantity         | `{ quantityLiters }` | `{ plan }` |
| GET    | `/api/customers/[customerCode]/calendar?month=&year=` | Monthly calendar   | —            | `{ days: CalendarDayRecord[] }` |

### Deliveries
| Method | Endpoint                         | Description                                | Request Body | Response |
| ------ | -------------------------------- | ------------------------------------------ | ------------ | -------- |
| GET    | `/api/deliveries?date=&area=&status=` | Get delivery run entries             | —            | `DeliveryRunResponse` |
| POST   | `/api/deliveries`                | Create / upsert delivery                   | `DeliveryFormData` | `{ delivery }` |
| DELETE | `/api/deliveries?customerCode=&date=` | Reset delivery to pending            | —            | `{ success: true }` |
| PATCH  | `/api/deliveries/[id]/status`    | Update delivery status by profile ID       | `{ status, date?, extraQuantity? }` | `{ delivery }` |

### Payments
| Method | Endpoint          | Description         | Request Body | Response |
| ------ | ----------------- | ------------------- | ------------ | -------- |
| GET    | `/api/payments`   | List all payments   | —            | `PaymentData[]` |
| POST   | `/api/payments`   | Create payment      | `PaymentFormData` | `PaymentData` |

### Products
| Method | Endpoint                    | Description      | Request Body | Response |
| ------ | --------------------------- | ---------------- | ------------ | -------- |
| GET    | `/api/products`             | List all products| —            | `ProductData[]` |
| POST   | `/api/products`             | Create product   | `{ code?, name, category, unit, defaultRate, isActive? }` | `ProductData` |
| PUT    | `/api/products/[code]`      | Update product   | body          | `ProductData` |
| DELETE | `/api/products/[code]`      | Delete product   | —            | `{ success: true }` |

### Vendors
| Method | Endpoint                    | Description      | Request Body | Response |
| ------ | --------------------------- | ---------------- | ------------ | -------- |
| GET    | `/api/vendors`              | List all vendors | —            | `VendorData[]` |
| POST   | `/api/vendors`              | Create vendor    | `{ code?, name, phone?, defaultRate?, areaCode?, notes?, isActive? }` | `VendorData` |
| PUT    | `/api/vendors/[code]`       | Update vendor    | body          | `VendorData` |
| DELETE | `/api/vendors/[code]`       | Delete vendor    | —            | `{ success: true }` |

### Milk Entries (Vendor Inflow)
| Method | Endpoint                                     | Description            | Request Body | Response |
| ------ | -------------------------------------------- | ---------------------- | ------------ | -------- |
| GET    | `/api/milk-entries?vendorCode=&dateFrom=&dateTo=` | List milk entries | —            | `{ entries: MilkEntryData[], summary: { totalMilk, totalAmount, totalUnpaid } }` |
| POST   | `/api/milk-entries`                          | Create milk entry      | `{ vendorCode, date, quantity, rate, status? }` | `MilkEntryData` |
| PUT    | `/api/milk-entries/[entryId]`                | Update milk entry      | body          | `MilkEntryData` |
| DELETE | `/api/milk-entries/[entryId]`                | Delete milk entry      | —            | `{ success: true }` |

### Purchases
| Method | Endpoint                       | Description         | Request Body | Response |
| ------ | ------------------------------ | ------------------- | ------------ | -------- |
| GET    | `/api/purchases`               | List all purchases  | —            | `PurchaseEntryData[]` |
| POST   | `/api/purchases`               | Create purchase     | `{ vendorCode, productCode, quantity, rate, paymentStatus?, note?, date? }` | `PurchaseEntryData` |
| PUT    | `/api/purchases/[purchaseId]`  | Update purchase     | body          | `PurchaseEntryData` |
| DELETE | `/api/purchases/[purchaseId]`  | Delete purchase     | —            | `{ success: true }` |

---

## Navigation Structure (Expo Router)

### Admin App

```
app/
  _layout.tsx                    # Auth guard, theme provider
  (auth)/
    _layout.tsx
    login.tsx
    select-role.tsx
  
  (admin)/
    _layout.tsx                   # Admin shell (sidebar/bottom tabs)
    (tabs)/
      _layout.tsx                 # Bottom tab navigator
      dashboard.tsx
      customers/
        _layout.tsx               # Stack navigator
        index.tsx                 # Customer list
        new.tsx                   # Create customer
        [customerCode]/
          index.tsx               # Customer detail
          edit.tsx                # Edit customer
      deliveries.tsx
      calendar.tsx
    billing.tsx
    areas.tsx
    products.tsx
    vendors.tsx
    purchases.tsx
    milk-entries.tsx
    reports/
      index.tsx
      area-insights.tsx
    customers/
      [customerCode]/
        index.tsx                 # Fallback for deep link
        edit.tsx
```

### Customer App

```
app/
  _layout.tsx
  
  (customer)/
    _layout.tsx                   # Customer shell
    (tabs)/
      _layout.tsx
      dashboard.tsx
      calendar.tsx
      history.tsx
      billing.tsx
    profile.tsx
```

### Single Combined App

```
app/
  _layout.tsx                     # Root: auth check → redirect to role-based layout
  (auth)/
    login.tsx
    select-role.tsx
  
  (admin)/                        # Admin tab navigator
    _layout.tsx
    (tabs)/
      _layout.tsx
      dashboard.tsx
      customers-stack/
        index.tsx
        new.tsx
        [customerCode]/
          index.tsx
          edit.tsx
      deliveries.tsx
      calendar.tsx
      more.tsx                    # More tab → areas, products, vendors, purchases, billing, reports
        more-screens/
          billing.tsx
          areas.tsx
          products.tsx
          vendors.tsx
          purchases.tsx
          milk-entries.tsx
          reports.tsx
          area-insights.tsx
  
  (customer)/                     # Customer tab navigator
    _layout.tsx
    (tabs)/
      _layout.tsx
      dashboard.tsx
      calendar.tsx
      history.tsx
      billing.tsx
      profile.tsx
```

---

## Screen-by-Screen Implementation Plan

### AUTH SCREENS

#### 1. Login Screen
- **File**: `app/(auth)/login.tsx`
- **Form**: Phone number input (10 digits)
- **Action**: POST to `/api/auth/login` (future) or GET `/api/auth/me` (current bypass)
- **On success**: Store user data in Zustand, redirect to role-based dashboard
- **States**: Loading, error, phone validation

#### 2. Select Role Screen
- **File**: `app/(auth)/select-role.tsx`
- **UI**: Two cards: "Milkman (Admin)" and "Customer". Tapping sets role in localStorage/AsyncStorage and navigates to the appropriate tab layout

---

### ADMIN SCREENS

#### 3. Admin Dashboard
- **File**: `app/(admin)/(tabs)/dashboard.tsx`
- **Data**: GET `/api/auth/me` (for area/name), derive KPIs from:
  - `GET /api/customers` → count active
  - `GET /api/deliveries?date=today` → today's delivery counts
  - `GET /api/payments` → monthly collection
- **UI Components**:
  - Stat cards: Active Customers, Today's Deliveries, Monthly Sales, Outstanding Dues
  - Progress bars: delivery completion, payment recovery, collection rate, milk inward coverage
  - Quick action buttons: "Start Delivery Run", "Add Customer", "Record Payment", "Capture Purchase"
  - Attention list: overdue payments, paused/skipped deliveries, unpaid vendor purchases
  - Live clock with area name greeting
  - Collection rate badge

#### 4. Customer List
- **File**: `app/(admin)/(tabs)/customers/index.tsx`
- **Data**: `GET /api/customers` → `{ customers: CustomerProfileData[] }`
- **UI Components**:
  - Search bar (name / code / phone)
  - Filter chips: All / Active / Inactive / Paused
  - FlatList with swipe-to-reveal actions (Edit, Delete, Quick Quantity Change)
  - Each item: name, code, phone, area, quantity, rate, status badge
  - FAB to create new customer
  - Pull-to-refresh

#### 5. Create Customer
- **File**: `app/(admin)/customers/new.tsx`
- **Data**: `POST /api/customers`
- **Form fields** (React Hook Form + Zod):
  - Name, Phone, Language picker (en/hi/pa)
  - Address Line 1, Address Line 2
  - Area (picker from `GET /api/areas`)
  - Landmark, Notes, Delivery Instruction
  - Quantity (liters), Price per Liter
  - Status toggle
  - Auto-generated customer code (server-side)
- **Validation**: Phone uniqueness, area existence, required fields
- **On success**: Navigate to customer detail

#### 6. Customer Detail
- **File**: `app/(admin)/customers/[customerCode]/index.tsx`
- **Data**: `GET /api/customers/[customerCode]`
- **UI Components**:
  - Hero card: name, code, phone, area
  - Contact section: address, instructions, landmark
  - Plan section: quantity, rate, unit label
  - Financial summary: total billed, paid, due
  - Account ledger: expandable full billing & payment history per month with running balance
  - Recent delivery log (last 7 days)
  - Quick actions: Edit, Change Quantity, Mark Delivery, Record Payment
  - Calendar mini-preview

#### 7. Edit Customer
- **File**: `app/(admin)/customers/[customerCode]/edit.tsx`
- **Data**: `PUT /api/customers/[customerCode]`
- **Form**: Same as Create, pre-filled with existing data
- **On success**: Navigate back to detail

#### 8. Deliveries (Daily Run)
- **File**: `app/(admin)/(tabs)/deliveries.tsx`
- **Data**: `GET /api/deliveries?date=today&area=AREA_CODE&status=ALL`
- **UI Components**:
  - Date picker (default: today)
  - Area filter (dropdown from `/api/areas`)
  - Status filter chips: All / Delivered / Skipped / Paused / Pending
  - Summary bar: `12 Delivered | 2 Skipped | 1 Paused | 5 Pending`
  - Search within delivery list
  - FlatList of customers, each showing:
    - Customer name, code, area
    - Default quantity (from plan)
    - Quick action buttons: `[Deliver] [Skip] [Pause]` with color coding
    - If status = delivered: show actual quantity, editable extra quantity field
    - Add-on products section when marking delivered: quick-add buttons for Ghee, Lassi, Paneer, Curd, etc. (fetched from `GET /api/products` filtered by `DAIRY_ADDON`), each with quantity stepper
    - Delivery instruction if any
    - Long press → detail modal
  - Pull-to-refresh
  - **Swipe actions**: left to mark delivered, right to mark skipped

#### 9. Calendar (Admin)
- **File**: `app/(admin)/(tabs)/calendar.tsx`
- **Data**: Build month from `GET /api/customers/[code]/calendar` aggregated, or `GET /api/deliveries` for full month
- **UI Components**:
  - Month/Year navigation (chevrons)
  - Color-coded month grid:
    - Green = Delivered, Red = Skipped, Yellow = Paused, Gray = Pending
  - Day tap → filter deliveries for that date and show modal with list
  - Stats below grid: total liters, delivered days, peak day
  - Area filter
  - Revenue estimate for the month

#### 10. Billing Dashboard
- **File**: `app/(admin)/billing.tsx`
- **Data**: `GET /api/payments`, `GET /api/customers` (for aggregate)
- **UI Components**:
  - Summary cards: Total Billed, Total Received, Total Due
  - Payment entry form: customer picker, amount, mode (CASH/UPI/BANK), date, note → `POST /api/payments`
  - Recent payments list (grouped by customer-date)
  - Per-customer expandable rows with running balance
  - Pull-to-refresh

#### 11. Areas CRUD
- **File**: `app/(admin)/areas.tsx`
- **Data**: `GET/POST/PUT/DELETE /api/areas`
- **UI Components**:
  - FlatList of areas with name (EN/HI/PA), code, active status
  - Swipe to edit/delete
  - FAB to create new area
  - Modal form: code (auto), name (multi-language), active toggle

#### 12. Products CRUD
- **File**: `app/(admin)/products.tsx`
- **Data**: `GET/POST/PUT/DELETE /api/products`
- **UI Components**:
  - FlatList with category badges: MILK / DAIRY_ADDON / OTHER
  - Each item: code, name, unit, default rate, active status
  - FAB to create
  - Modal form: code, name, category picker, unit, default rate, active toggle

#### 13. Vendors CRUD
- **File**: `app/(admin)/vendors.tsx`
- **Data**: `GET/POST/PUT/DELETE /api/vendors`
- **UI Components**:
  - FlatList with vendor info: code, name, phone, area, active
  - Tap → detail view with purchase summary (total purchases, milk inward, unpaid entries)
  - FAB to create

#### 14. Purchases (Ledger)
- **File**: `app/(admin)/purchases.tsx`
- **Data**: `GET/POST/PUT/DELETE /api/purchases`
- **UI Components**:
  - FlatList with purchase entries: vendor name, product, quantity, rate, amount, date, payment status badge
  - Date range filter
  - Summary: total purchase amount, milk inward, unpaid count
  - FAB to create purchase entry (vendor picker + product picker + quantity + rate + payment status)

#### 15. Milk Entries (Vendor Inflow)
- **File**: `app/(admin)/milk-entries.tsx`
- **Data**: `GET/POST/PUT/DELETE /api/milk-entries`
- **UI Components**:
  - Vendor filter + date range
  - Summary: total milk, total amount, unpaid total
  - FlatList: vendor name, date, quantity, rate, total, status badge
  - FAB to create entry

#### 16. Reports
- **File**: `app/(admin)/reports/index.tsx`
- **Data**: Aggregated from customer, delivery, payment APIs
- **UI Components**:
  - Area analytics cards: customers per area, daily/monthly consumption, billed amount, due
  - Top consumption area highlight
  - Collection rate percentage
  - Bar chart: area-wise consumption
  - Purchase total + milk inward summary

#### 17. Area Insights (Drill-down)
- **File**: `app/(admin)/reports/area-insights.tsx`
- **Data**: Filtered reports by area
- **UI Components**:
  - Area picker
  - Detailed stats: total customers, active plans, daily liters, monthly billed, payments collected
  - Trend chart over last 30 days

---

### CUSTOMER SCREENS

#### 18. Customer Dashboard
- **File**: `app/(customer)/(tabs)/dashboard.tsx`
- **Data**: `GET /api/auth/me` + `GET /api/customers/[code]/calendar?month&year`
- **UI Components**:
  - Greeting: "Good Morning, {name}" with area name
  - Current subscription card: quantity, rate, monthly estimate
  - Today's delivery status badge (Delivered/Skipped/Paused/Pending)
  - Tomorrow's scheduled delivery info (planned quantity, any known exceptions)
  - Mini calendar preview (current week)
  - Stats: Monthly Billed, Paid, Due
  - Quick action buttons: View Calendar, Delivery History, Billing, Profile
  - Subscription status badge

#### 19. Customer Calendar
- **File**: `app/(customer)/(tabs)/calendar.tsx`
- **Data**: `GET /api/customers/[customerCode]/calendar?month=&year=`
- **UI Components**:
  - Month grid with color-coded days (same as admin)
  - Stats below: total liters, delivered days, skipped/paused days, estimated bill

#### 20. Delivery History
- **File**: `app/(customer)/(tabs)/history.tsx`
- **Data**: Filtered from calendar or `GET /api/deliveries` filtered by customer
- **UI Components**:
  - FlatList of recent deliveries with date, status, quantity
  - Status badge on each item
  - Pull-to-refresh

#### 21. Customer Billing
- **File**: `app/(customer)/(tabs)/billing.tsx`
- **Data**: `GET /api/payments` filtered by customer + delivery totals
- **UI Components**:
  - Summary: Monthly Bill, Amount Paid, Due Amount
  - Payment history list: date, amount, mode, note
  - Running balance

#### 22. Customer Profile
- **File**: `app/(customer)/profile.tsx`
- **Data**: `GET /api/auth/me` + `GET /api/customers/[code]`
- **UI Components**:
  - Contact info: name, phone, address, area
  - Plan info: quantity, rate
  - Language switcher (en/hi/pa toggle)
  - Sign out button

---

## Shared UI Components Library

| Component               | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `AdminShell`            | Layout wrapper with top bar + bottom tabs    |
| `CustomerShell`         | Layout wrapper for customer portal           |
| `StatCard`              | KPI metric card (value + label + icon)       |
| `StatusBadge`           | Colored badge for delivery/status            |
| `CustomerListItem`      | Reusable customer row in lists               |
| `DeliveryActionButtons` | Deliver / Skip / Pause button group          |
| `MonthGrid`             | Calendar month grid component                |
| `PaymentEntryForm`      | Reusable payment form                        |
| `CustomerForm`          | Reusable create/edit customer form           |
| `SearchBar`             | Text input with search icon + debounce       |
| `FilterChips`           | Horizontal scrollable filter chips           |
| `LoadingOverlay`        | Full-screen loading spinner                  |
| `EmptyState`            | Empty list placeholder with illustration     |
| `ErrorState`            | Error view with retry button                 |
| `ConfirmationModal`     | Confirm destructive actions                  |
| `AreaPicker`            | Dropdown component for selecting areas       |
| `ProductPicker`         | Dropdown for selecting products              |
| `VendorPicker`          | Dropdown for selecting vendors               |
| `QuantityInput`         | Numeric input for milk liters                |

---

## Project File Structure

```
milkman-mobile/
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── tailwind.config.js
├── app/
│   ├── _layout.tsx                    # Root layout
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── select-role.tsx
│   ├── (admin)/
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── deliveries.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── customers-stack/
│   │   │       ├── index.tsx
│   │   │       ├── new.tsx
│   │   │       └── [customerCode]/
│   │   │           ├── index.tsx
│   │   │           └── edit.tsx
│   │   ├── billing.tsx
│   │   ├── areas.tsx
│   │   ├── products.tsx
│   │   ├── vendors.tsx
│   │   ├── purchases.tsx
│   │   ├── milk-entries.tsx
│   │   └── reports/
│   │       ├── index.tsx
│   │       └── area-insights.tsx
│   └── (customer)/
│       ├── _layout.tsx
│       ├── (tabs)/
│       │   ├── _layout.tsx
│       │   ├── dashboard.tsx
│       │   ├── calendar.tsx
│       │   ├── history.tsx
│       │   └── billing.tsx
│       └── profile.tsx
├── src/
│   ├── api/
│   │   ├── client.ts                  # Axios instance with base URL + interceptors
│   │   ├── auth.ts                    # Auth API functions
│   │   ├── customers.ts               # Customer API functions
│   │   ├── deliveries.ts              # Delivery API functions
│   │   ├── payments.ts                # Payment API functions
│   │   ├── areas.ts                   # Area API functions
│   │   ├── products.ts                # Product API functions
│   │   ├── vendors.ts                 # Vendor API functions
│   │   ├── purchases.ts               # Purchase API functions
│   │   └── milk-entries.ts            # Milk entry API functions
│   ├── hooks/
│   │   ├── useAuth.ts                 # Auth state + login/logout
│   │   ├── useCustomers.ts            # React Query: customer list/detail
│   │   ├── useDeliveries.ts           # React Query: delivery run
│   │   ├── usePayments.ts             # React Query: payments
│   │   ├── useAreas.ts                # React Query: areas
│   │   ├── useProducts.ts             # React Query: products
│   │   ├── useVendors.ts              # React Query: vendors
│   │   ├── usePurchases.ts            # React Query: purchases
│   │   ├── useMilkEntries.ts          # React Query: milk entries
│   │   └── useCalendar.ts             # React Query: calendar
│   ├── store/
│   │   ├── auth-store.ts              # Zustand: user, role, token
│   │   └── app-store.ts               # Zustand: selected area, date, filters
│   ├── types/
│   │   ├── index.ts                   # All shared types (mirrors web)
│   │   ├── api.ts                     # API request/response types
│   │   └── navigation.ts              # Navigation param types
│   ├── i18n/
│   │   ├── index.ts                   # i18next config (detect from SecureStore + fallback to en)
│   │   ├── en.json                    # English translations
│   │   ├── hi.json                    # Hindi translations
│   │   └── pa.json                    # Punjabi translations (Gurmukhi script)
│   ├── utils/
│   │   ├── formatters.ts              # formatCurrencyINR, formatDate, etc.
│   │   ├── validators.ts              # Zod schemas (mirror web)
│   │   └── constants.ts               # APP_NAME, status enums, etc.
│   ├── components/
│   │   ├── ui/
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── ConfirmationModal.tsx
│   │   │   └── QuantityInput.tsx
│   │   ├── admin/
│   │   │   ├── CustomerListItem.tsx
│   │   │   ├── DeliveryActionButtons.tsx
│   │   │   ├── DeliveryListItem.tsx
│   │   │   ├── PaymentEntryForm.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   └── PurchaseEntryForm.tsx
│   │   ├── customer/
│   │   │   ├── SubscriptionCard.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── BillingSummary.tsx
│   │   ├── calendar/
│   │   │   ├── MonthGrid.tsx
│   │   │   ├── CalendarDay.tsx
│   │   │   └── DayDetailModal.tsx
│   │   └── shared/
│   │       ├── AreaPicker.tsx
│   │       ├── ProductPicker.tsx
│   │       ├── VendorPicker.tsx
│   │       └── LanguageSwitcher.tsx
│   └── theme/
│       ├── colors.ts                  # Forest green + vibrant green theme
│       ├── typography.ts
│       └── index.ts
```

---

## Implementation Order

| Phase | Screens / Features                              | Est. Days |
| ----- | ----------------------------------------------- | --------- |
| **P1** | Project setup, API client, auth flow, types     | 2         |
| **P2** | Admin shell, dashboard, customer list + CRUD    | 3         |
| **P3** | Delivery run screen, status actions             | 2         |
| **P4** | Billing dashboard, payment entry                | 2         |
| **P5** | Calendar (admin + customer)                     | 3         |
| **P6** | Areas, Products, Vendors CRUD screens           | 2         |
| **P7** | Purchases, Milk Entries screens                 | 2         |
| **P8** | Reports, Area Insights                          | 2         |
| **P9** | Customer app: dashboard, calendar, history      | 2         |
| **P10** | Customer app: billing, profile                 | 1         |
| **P11** | i18n (en/hi/pa), polish, edge cases, testing    | 2         |
|        | **Total**                                       | **23**    |

---

## Key Implementation Details

### API Client (`src/api/client.ts`)
```typescript
import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Auth Store (`src/store/auth-store.ts`)
```typescript
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: "ADMIN" | "CUSTOMER" | null;
  setAuth: (user: AuthUser, token?: string) => void;
  setRole: (role: "ADMIN" | "CUSTOMER") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      setAuth: (user, token) =>
        set({ user, token, role: user.role }),
      setRole: (role) => set({ role }),
      logout: () => set({ user: null, token: null, role: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### React Query Hook Pattern
```typescript
// src/hooks/useDeliveries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/client";
import type { DeliveryRunResponse, DeliveryFormData } from "@/types";

export function useDeliveryRun(date: string, area: string, status: string) {
  return useQuery<DeliveryRunResponse>({
    queryKey: ["deliveries", date, area, status],
    queryFn: () =>
      apiClient
        .get("/deliveries", { params: { date, area, status } })
        .then((r) => r.data),
  });
}

export function useMarkDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeliveryFormData) =>
      apiClient.post("/deliveries", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });
}
```

### Calendar Implementation
- Build using `react-native-calendars` `CalendarList` or a custom `MonthGrid` component
- Color-coded dots: `{ "2026-05-12": { dots: [{ key: "delivered", color: "green" }] } }`
- Tap handler opens DayDetailModal showing filtered customer list

### Delivery Quick Actions
- Three buttons per row: `[Delivered (green)] [Skip (red)] [Pause (yellow)]`
- `POST /api/deliveries` with `{ customerCode, status, actualQuantity?, extraQuantity?, date }`
- Optimistic update with React Query: update cache immediately, rollback on error
- Haptic feedback on action

### Theme (Matches Web)
```typescript
export const colors = {
  primary: "#064e3b",     // Forest green
  primaryLight: "#22c55e", // Vibrant green
  background: "#f8fafc",
  surface: "#ffffff",
  danger: "#ef4444",
  warning: "#eab308",
  success: "#22c55e",
  text: "#1e293b",
  textSecondary: "#64748b",
  border: "#e2e8f0",
};
```

---

## API Route Map (Fast Implementation Reference)

| API Endpoint                          | Admin Screen(s)        | Customer Screen(s)   |
| ------------------------------------- | ---------------------- | -------------------- |
| `GET /api/auth/me`                    | Dashboard              | Dashboard, Profile   |
| `GET /api/areas`                      | Areas, Deliveries      | —                    |
| `POST /api/areas`                     | Areas (create)         | —                    |
| `PUT /api/areas/[code]`              | Areas (edit)           | —                    |
| `DELETE /api/areas/[code]`           | Areas (delete)         | —                    |
| `GET /api/customers`                  | Customer List          | —                    |
| `POST /api/customers`                 | Customer Create        | —                    |
| `GET /api/customers/[code]`           | Customer Detail        | Profile              |
| `PUT /api/customers/[code]`           | Customer Edit          | —                    |
| `PATCH /api/customers/[code]/quantity`| Customer Detail        | —                    |
| `GET /api/customers/[code]/calendar`  | Calendar               | Calendar             |
| `GET /api/deliveries`                 | Deliveries             | History              |
| `POST /api/deliveries`                | Deliveries (mark)      | —                    |
| `DELETE /api/deliveries`              | Deliveries (reset)     | —                    |
| `PATCH /api/deliveries/[id]/status`   | Deliveries (quick)     | —                    |
| `GET /api/payments`                   | Billing                | Billing              |
| `POST /api/payments`                  | Billing (record)       | —                    |
| `GET /api/products`                   | Products               | —                    |
| `POST /api/products`                  | Products (create)      | —                    |
| `PUT /api/products/[code]`           | Products (edit)        | —                    |
| `DELETE /api/products/[code]`        | Products (delete)      | —                    |
| `GET /api/vendors`                    | Vendors                | —                    |
| `POST /api/vendors`                   | Vendors (create)       | —                    |
| `PUT /api/vendors/[code]`            | Vendors (edit)         | —                    |
| `DELETE /api/vendors/[code]`         | Vendors (delete)       | —                    |
| `GET /api/purchases`                  | Purchases              | —                    |
| `POST /api/purchases`                 | Purchases (create)     | —                    |
| `PUT /api/purchases/[id]`            | Purchases (edit)       | —                    |
| `DELETE /api/purchases/[id]`         | Purchases (delete)     | —                    |
| `GET /api/milk-entries`               | Milk Entries           | —                    |
| `POST /api/milk-entries`              | Milk Entries (create)  | —                    |
| `PUT /api/milk-entries/[id]`         | Milk Entries (edit)    | —                    |
| `DELETE /api/milk-entries/[id]`      | Milk Entries (delete)  | —                    |
| `GET /api/health`                     | Settings / splash      | Settings / splash     |
