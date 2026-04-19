# Laxmi Oils - Deployment Guide

Complete step-by-step guide to deploy on **Vercel** (Frontend) + **Render** (Backend).

---

## Step 1: Push to GitHub

### 1.1 Initialize Git (if not already done)
```bash
# From project root
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `laxmi-oils` (or any name)
3. Keep it **Public** or **Private**
4. Click **Create repository**

### 1.3 Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/laxmi-oils.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create Web Service
1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `laxmi-oils-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

### 2.2 Add Environment Variables
Click **Environment** tab and add these:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<your-mongodb-url>
JWT_SECRET=<generate-random-string-32-chars>
JWT_EXPIRE_DAYS=7
ADMIN_EMAIL=admin@laxmioils.com
ADMIN_PASSWORD=laxmi@admin2026
CLIENT_ORIGIN=https://your-vercel-frontend.vercel.app
RAZORPAY_KEY_ID=<your-razorpay-key>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
```

> **Get DATABASE_URL**: Use MongoDB Atlas (free tier) → [mongodb.com](https://mongodb.com)
> **JWT_SECRET**: Generate at [random.org](https://random.org/strings)

### 2.3 Deploy
Click **Deploy**. Wait for build to complete.

**Copy your backend URL** (e.g., `https://laxmi-oils-api.onrender.com`)

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Project
1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **Add New Project**
3. Import from GitHub → Select your repo

### 3.2 Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `next build`
- **Output Directory**: (leave default)

### 3.3 Add Environment Variables
Click **Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://laxmi-oils-api.onrender.com
```

> Replace with your actual Render backend URL from Step 2.3

### 3.4 Deploy
Click **Deploy**. Wait for build to complete.

---

## Step 4: Update CORS (Important!)

After both deploy, update your backend to allow the Vercel frontend:

### 4.1 Go back to Render Dashboard
1. Open your Web Service
2. Click **Environment**
3. Update `CLIENT_ORIGIN` to your Vercel URL:
   ```
   CLIENT_ORIGIN=https://laxmi-oils.vercel.app
   ```
4. Click **Save Changes** → Service will redeploy

---

## Step 5: Verify Deployment

### Test Backend
```bash
curl https://laxmi-oils-api.onrender.com/api/health
```

### Test Frontend
Open your Vercel URL and verify:
- [ ] Homepage loads
- [ ] Products display
- [ ] Login works (admin@laxmioils.com / laxmi@admin2026)
- [ ] Cart functionality

---

## Troubleshooting

### Build Fails on Render
```bash
# Add this to Render build command if prisma fails:
npm install && npm run build && npx prisma generate && npx prisma db push
```

### CORS Errors
- Double-check `CLIENT_ORIGIN` matches your Vercel URL exactly (no trailing slash)
- Include `https://`

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` in Vercel env vars
- Make sure it has `https://` prefix
- No trailing slash at the end

### Database Connection Failed
- Whitelist `0.0.0.0/0` in MongoDB Atlas (allows all IPs)
- Verify `DATABASE_URL` format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

---

## Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://laxmi-oils.vercel.app` | Customer website |
| Backend | `https://laxmi-oils-api.onrender.com` | API + Admin panel |
| Database | MongoDB Atlas | Data storage |

**Test Credentials**:
- Admin: `admin@laxmioils.com` / `laxmi@admin2026`
