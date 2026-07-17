<div align="center">

# 🧺 LAUNDRIX

### Smart Multi-Branch & Multi-Vendor Laundry Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-5.x-gray?style=for-the-badge&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

*From pickup to delivery — every garment tracked, every operation managed.*

</div>

---

## 📖 Overview

**LAUNDRIX** is a next-generation Multi-Branch and Multi-Vendor Laundry Management Platform designed to digitize the complete laundry operation — from pickup request to final delivery.

Instead of customers visiting a physical laundry shop or contacting different service providers individually, they can:

- 📅 Schedule pickups at their convenience
- 🧺 Customize laundry services and garment quantities
- 💳 Make secure online payments
- 🔍 Track every garment through a single intelligent platform

The platform supports both **company-owned laundry branches** and **third-party laundry vendors** operating under one centralized ecosystem. Customers never communicate directly with vendors — all operations are managed by LAUNDRIX through intelligent branch assignment, vendor allocation, QR-based garment tracking, route optimization, quality control, and centralized administration.

> Every garment receives a unique **waterproof QR code or barcode label** during pickup. This label remains attached throughout sorting, washing, drying, ironing, quality inspection, packaging, and delivery — ensuring complete traceability and preventing garment mix-ups.

---

## 🎯 Mission & Vision

| | |
|---|---|
| **Mission** | To transform the traditional laundry industry through a centralized, technology-driven platform that enables customers to schedule laundry services effortlessly, securely pay online, and track every garment throughout its lifecycle — while empowering branches and vendors to operate efficiently under one intelligent ecosystem. |
| **Vision** | To become Bangladesh's leading digital laundry ecosystem by building the country's largest network of company-operated branches and trusted laundry partners, delivering transparent operations, QR-based garment traceability, optimized logistics, standardized service quality, and seamless customer experiences across every city. |

---

## 💼 Business Model

LAUNDRIX operates as a **Managed Multi-Branch & Multi-Vendor Marketplace**. Unlike traditional laundry marketplaces, customers never communicate directly with laundry vendors or branches.

```
Customer registers & logs in
        ↓
Selects pickup address & laundry services
        ↓
Adds garments, quantities & optional services
        ↓
Selects pickup date & time → Reviews order → Pays online
        ↓
Order confirmed → Nearest branch/vendor assigned
        ↓
Pickup agent collects garments → QR labels generated
        ↓
Branch/Vendor processes garments → Quality inspection
        ↓
Packaging → Delivery agent assigned → Out for delivery
        ↓
Delivered → Customer leaves a review ⭐
```

This centralized approach ensures **consistent pricing**, **standardized quality**, **efficient logistics**, and **complete operational control**.

---

## ⚙️ Core Capabilities

| Feature | Description |
|---|---|
| 🏢 Multi-Branch Management | Manage multiple company-owned laundry branches |
| 🤝 Multi-Vendor Management | Onboard and manage third-party laundry vendors |
| 🗺️ Zone-wise Operations | Assign branches and agents by geographic zones |
| 📦 QR/Barcode Garment Tracking | Unique labels per garment for end-to-end tracking |
| 🚗 Pickup & Delivery Scheduling | Flexible time-slot based scheduling |
| 🛣️ Route Optimization | Smart agent routing for efficient deliveries |
| 📊 Capacity-Based Assignment | Auto-assign to vendors when branches are full |
| 💰 Online Payments | Secure payment processing with wallet support |
| 🔔 Customer Notifications | Real-time order status updates |
| 📈 Operational Analytics | Dashboards, reports, and performance metrics |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI, Base UI, Framer Motion
- **State Management:** Redux Toolkit, React Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

### Backend
- **Server:** Express.js 5
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Authentication:** JWT (Access + Refresh tokens) + Google & Facebook OAuth
- **File Uploads:** Multer + AWS S3
- **Email:** Nodemailer with Handlebars templates
- **SMS:** Twilio
- **Security:** Helmet, CORS, bcrypt

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### 1. Clone the repository
```bash
git clone https://github.com/jevxo26/LAVO.git
cd LAVO
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in all the values in `.env` — database URL, JWT secrets, OAuth keys, etc.

### 4. Push the database schema
```bash
npx prisma db push
```

### 5. Seed the Super Admin account
```bash
npx ts-node prisma/seed.ts
```

### 6. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Admin Credentials

> ⚠️ The default admin credentials are confidential. Contact the project owner or check your internal documentation.

---

## 👥 User Roles

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Full platform access — settings, all modules |
| `ADMIN` | Manage users, branches, vendors, services, finance |
| `BRANCH_MANAGER` | Manage a specific branch |
| `DELIVERY_AGENT` | Handle pickups and deliveries |
| `CUSTOMER` | Book services, track orders, make payments |

> Staff accounts (`BRANCH_MANAGER`, `DELIVERY_AGENT`) are created by an Admin through the dashboard. Public registration always creates a `CUSTOMER` account.

---

## 🧺 Service Categories

**Clothing:** Shirts · T-Shirts · Pants · Jeans · Suits · Blazers · Sarees · Punjabis · Jackets · Sweaters

**Household:** Blankets · Bedsheets · Curtains · Carpets · Sofa Covers · Pillows

**Specialty:** Shoes · Corporate Laundry · Hotel Laundry

### Optional Add-ons
`Wash Only` · `Wash + Fold` · `Wash + Iron` · `Dry Cleaning` · `Steam Iron` · `Premium Care` · `Express Service` · `Stain Removal` · `Fabric Softener` · `Perfume Finish` · `Separate Washing` · `Delicate Care`

*Each selected option updates the total price automatically.*

---

## 📂 Project Structure

```
LAVO/
├── src/                    # Next.js frontend (App Router)
│   ├── app/                # Pages and routes
│   ├── components/         # Reusable UI components
│   ├── store/              # Redux store & slices
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & API client
│   └── proxy.ts            # Route protection (Next.js 16)
├── server/                 # Express.js backend
│   ├── routes/             # API route definitions
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── middlewares/        # Auth, role, upload middlewares
│   └── index.ts            # Server entry point
├── prisma/
│   ├── schema/             # Modular Prisma schema files
│   └── seed.ts             # Database seeder
└── .env.example            # Environment variable template
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Sync schema to database |
| `npx ts-node prisma/seed.ts` | Seed initial admin account |

---

<div align="center">

Built with ❤️ by the **Jevxo** team

</div>


We are Lavo team, developing this project - Laundrix