# Laxmi Oils API

Express + Prisma API for the Laxmi Oils e-commerce storefront.

## Commands

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

## Environment

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: long random secret
- `CLIENT_ORIGIN`: frontend origin, default `http://localhost:3000`
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Razorpay keys when real checkout is enabled
- Shiprocket or Delhivery credentials when shipping automation is enabled

If real shipping credentials are not configured, the shipping service returns a manual fallback tracking link so order status workflows still work locally.
