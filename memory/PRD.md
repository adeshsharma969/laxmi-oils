# Laxmi Edible Oils — Full-Stack FMCG E-commerce

## Problem Statement
New-age Jaipur-based edible oils brand. Premium neo-brutalist UI (CRED/Instamart quality), full e-commerce with auth, admin, orders, B2B leads, policies.

## Stack
- **Backend**: FastAPI + Motor (MongoDB) + bcrypt + PyJWT + httpx — port 8001
- **Frontend**: React 19 + Tailwind + Framer Motion 12 + Lucide + axios
- **Auth**: JWT (email/password) + Google social login (optional)
- **Payments**: Razorpay MOCKED

## Personas
- **Guest shopper** — browse, add to cart, checkout without login
- **Registered customer** — all of above + order history, profile
- **Admin** — Products CRUD, orders status management, B2B leads, stats dashboard

## Implemented (2026-02-18)
### Backend endpoints
- `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/me`
- `GET/POST /api/products`, `GET/PUT/DELETE /api/products/{id}`
- `POST /api/orders` (guest/auth), `GET /api/orders/me`, `GET /api/orders/{id}`
- `POST /api/b2b/leads`
- Admin: `GET /api/admin/stats`, `/admin/orders`, `/admin/leads`; `PUT /admin/orders/{id}/status`, `/admin/leads/{id}/status`
- Seed on startup: admin user + 6 products, indexes on email/user_id/product_id/order_id/lead_id

### Frontend pages
- Home (hero bento, marquee, categories, Why Laxmi, bestsellers from API, story parallax, testimonials, blogs)
- Products (filters + sort, API-backed)
- Product Detail (4-image gallery, pack size selector, nutrition, benefits)
- Cart Drawer (localStorage, qty, remove, subtotal)
- Checkout (3-step stepper → POST /api/orders → Shukriya success)
- B2B (hero, pricing slabs, enquiry form → /api/b2b/leads)
- Login / Register (email/password)
- Account (profile card + order history)
- Admin (tabbed: Dashboard/Products/Orders/B2B Leads with CRUD + status updates + product editor modal)
- Terms, Privacy, FAQ (boilerplate tailored to Laxmi)
- Navbar with auth-aware menu, coupon banner (LAXMI100), WhatsApp floating button

### Design system
- Muted editorial palette: Ochre #D98F00, Forest Ink #1F3D2B, Charcoal #2B2A28, Terracotta #B8431A, Ivory #F5F1E8
- Typography: Cabinet Grotesk + Satoshi
- Brutal 5px shadows, 3px borders, noise overlay, page transitions, hover lifts

## Test Results (iteration_1)
- Backend: **32/32 passed (100%)**
- Frontend: **All flows verified (100%)**

## Test Credentials
- Admin: `admin@laxmioils.com` / `laxmi@admin2026`
- Demo customer: `demo@user.com` / `demo1234`

## P1 Backlog
- Real Razorpay integration
- Product reviews + image uploads
- Wishlist
- Newsletter capture
- Blog detail pages
- QR-code batch traceability
- Address book for logged-in customers
- Email order confirmations (via SendGrid/Resend)
