# Laxmi Oils E-commerce

Production-oriented e-commerce refactor with:

- Next.js App Router frontend in `frontend/src/app`
- Preserved existing React UI components in `frontend/src`
- Express REST API in `backend/src`
- MongoDB via Prisma in `backend/prisma`
- JWT auth, role-based admin access, products, cart, orders, payments, shipping hooks, B2B leads, and admin APIs.

## Local Setup

### Backend

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

Set `DATABASE_URL` to your MongoDB connection string. The previous `MONGO_URL` value can be reused as `DATABASE_URL`.

Optional production integrations:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`
- `DELHIVERY_API_TOKEN`

### Frontend

```bash
cd frontend
copy .env.example .env.local
yarn install
yarn dev
```

The frontend defaults to `http://localhost:8000/api`. Override it with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Architecture

### Frontend

- `frontend/src/app`: Next.js App Router pages and root layout
- `frontend/src/components`: existing UI components, kept visually intact
- `frontend/src/pages`: existing page bodies reused by App Router
- `frontend/src/lib/router.tsx`: compatibility layer for existing React Router imports
- `frontend/src/api/client.js`: API client with Next public env support
- `frontend/src/context`: auth and persistent cart providers

### Backend

- `backend/src/controllers`: HTTP request handlers
- `backend/src/services`: domain/business logic
- `backend/src/routes`: REST route modules
- `backend/src/middlewares`: auth, async, and error handling
- `backend/src/prisma`: Prisma client singleton
- `backend/prisma/schema.prisma`: MongoDB data model

## API Highlights

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `POST /api/products` admin only
- `GET /api/cart`
- `PUT /api/cart`
- `POST /api/orders`
- `GET /api/orders/me`
- `POST /api/payments/razorpay/order`
- `POST /api/payments/razorpay/verify`
- `GET /api/shipping/:orderId/track`
- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `GET /api/admin/orders.csv`
- `GET /api/admin/users`

## UI Preservation

The refactor keeps the existing visual components, Tailwind classes, animations, page copy, responsive layout, and brutalist design system intact. Next.js is introduced around the current presentation layer rather than rewriting the UI.
