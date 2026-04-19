# Laxmi Oils Frontend

Next.js App Router frontend that preserves the original Laxmi Oils UI, Tailwind classes, animations, and page composition.

## Commands

```bash
yarn install
yarn typecheck
yarn dev
yarn build
yarn start
```

## Environment

Copy `.env.example` to `.env.local`.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

## Structure

- `src/app`: Next.js App Router routes
- `src/components`: existing visual components
- `src/pages`: existing page bodies reused by routes
- `src/lib/router.tsx`: compatibility shim for existing React Router-style imports
- `src/context`: auth and cart providers
- `styles`: preserved global CSS and Tailwind entrypoint

The migration intentionally keeps the presentation layer intact. Architecture changed; UI did not.
