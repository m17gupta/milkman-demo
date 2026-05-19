# Milkman Application Features

Milkman is a lightweight, mobile-friendly milk delivery management application designed for Indian milk sellers. It provides a bilingual interface (English, Hindi, and Punjabi) and a robust set of tools for both administrators and customers.

## User Roles

The application defines two primary user roles, each with specific permissions and access levels:

### 1. ADMIN
The Super Admin role has full control over the application's data and operations.
- **Permissions**: CRUD operations on all entities, access to financial reports, and management of vendors and products.
- **Key Focus**: Operational efficiency, billing accuracy, and route management.

### 2. CUSTOMER
The Customer role has limited access to their own delivery and billing data.
- **Permissions**: View personal dashboard, consumption calendar, delivery history, and billing status.
- **Key Focus**: Transparency of usage, tracking dues, and profile management.

## General Features

- **Bilingual Support**: Fully localized UI in English, Hindi, and Punjabi.
- **Mobile-First Design**: Optimized for mobile-first usage with a clean, utility-focused interface.
- **Secure Authentication**: Secure session-based authentication using mobile numbers.
- **Indian Context Optimization**: INR currency formatting and Indian date/number conventions throughout the app.

## Admin Features

### Dashboard & Overview
- **Real-time Stats**: Track active customers, today's delivery progress, monthly sales, and outstanding dues.
- **Quick Actions**: Rapidly add customers, mark deliveries, record payments, or capture purchases.
- **Performance Tracking**: Monitor delivery completion, payment recovery, and milk inward coverage.

### Customer Management
- **Customer Profiles**: Comprehensive management of customer data including name, phone, address, landmarks, and delivery instructions.
- **Milk Plan Management**: Define flexible daily milk quantities (e.g., 1L, 2.5L) and customer-specific rates.
- **Account Monitoring**: View individual customer ledgers, billed amounts, and pending balances.

### Delivery Tracking
- **Daily Run Management**: Specialized interface for the morning delivery route.
- **One-Tap Marking**: Quickly mark deliveries as Delivered, Skipped, or Paused.
- **Flexible Logging**: Record extra milk deliveries and add-on product sales (Ghee, Lassi, etc.) on the fly.

### Billing & Payments
- **Payment Recording**: Log payments via Cash, UPI, or Bank modes with notes.
- **Automated Billing**: Monthly bill calculation based on delivered quantity and add-ons.
- **Ledger Overview**: Access detailed billing summaries and payment history for all customers.

### Vendor & Purchase Management
- **Supplier Profiles**: Manage milk vendors and supplier contact details.
- **Purchase Logs**: Track daily milk inward purchases and maintain records of supplier dues.
- **Inward Analytics**: Monitor total purchase amounts and unpaid purchase rows.

### Inventory & Route Management
- **Product Catalog**: Manage rates and units for milk and various dairy add-ons.
- **Area Management**: Define delivery areas and map customers to specific routes for better organization.

### Reports & Analytics
- **Area Insights**: Analyze customer distribution, consumption trends, and revenue by area.
- **Consumption Trends**: Visualize route demand over time through delivery records.
- **Financial Reports**: Summaries of monthly sales, collection rates, and outstanding dues.

## Customer Features

### Personal Dashboard
- **Delivery Status**: View today's delivery status and tomorrow's scheduled delivery.
- **Account Summary**: Quick view of the current daily plan, monthly billed amount, and pending dues.

### Consumption Calendar
- **Interactive Calendar**: Visual representation of daily milk consumption.
- **Status Legends**: Clearly see delivered, skipped, and paused days at a glance.
- **Monthly Estimates**: Projected bill based on consumption patterns.

### Billing & History
- **Delivery History**: Detailed log of recent deliveries, including extra items and add-ons.
- **Payment Status**: Track total amount paid and current outstanding balance.
- **Digital Billing**: View monthly billing summaries and recent billable add-ons.

### Profile Management
- **Contact Details**: View name, phone number, and preferred language.
- **Delivery Information**: Review exact delivery address and assigned area.

## Application Architecture & API Paths

The application follows a structured routing system for both pages and API endpoints.

### Frontend Route Groups
- `/(auth)`: Authentication routes (Login, Role Selection).
- `/(admin)/admin`: Administrative control panel routes.
- `/(customer)/customer`: Customer self-service portal routes.

### API Endpoints
The backend provides the following RESTful API paths:

| Module | Endpoint | Description |
| --- | --- | --- |
| **Auth** | `/api/auth/me` | Current session/user info |
| **Customers** | `/api/customers` | Customer list and creation |
| | `/api/customers/[code]` | Individual customer details |
| | `/api/customers/[code]/calendar` | Customer-specific delivery calendar |
| | `/api/customers/[code]/quantity` | Milk plan quantity management |
| **Deliveries** | `/api/deliveries` | Daily delivery records |
| | `/api/deliveries/[id]/status` | Update specific delivery status |
| **Milk Entries** | `/api/milk-entries` | Detailed consumption logs |
| **Payments** | `/api/payments` | Recording and tracking payments |
| **Products** | `/api/products` | Managing dairy product catalog |
| **Purchases** | `/api/purchases` | Vendor inward milk purchases |
| **Vendors** | `/api/vendors` | Managing milk suppliers |
| **Areas** | `/api/areas` | Managing delivery zones/routes |
| **Health** | `/api/health` | System status check |
