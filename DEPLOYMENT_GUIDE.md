# Melora Deployment Guide

## 1. Backend Environment
Create `backend/.env` from [backend/.env.example](C:\Users\Lenovo\Desktop\Melora\luxbag\backend\.env.example).

Required values:
- `NODE_ENV=production`
- `PORT=5000`
- `CLIENT_URL=https://your-domain.com`
- `CLIENT_URLS=https://your-domain.com,https://www.your-domain.com`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`

Optional but recommended:
- Email settings for order/admin notifications
- Cloudinary settings if you later move uploads away from local disk

## 2. Frontend Environment
Create `frontend/.env` from [frontend/.env.example](C:\Users\Lenovo\Desktop\Melora\luxbag\frontend\.env.example).

Recommended:
- `VITE_API_URL=https://your-domain.com/api`

## 3. Build and Run
From the project root:

```powershell
npm install
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

## 4. Nginx
Use [nginx.melora.conf.example](C:\Users\Lenovo\Desktop\Melora\luxbag\nginx.melora.conf.example) as the base config.

Important:
- frontend files should point to `frontend/dist`
- `/api` and `/uploads` should proxy to the backend on `127.0.0.1:5000`

## 5. MongoDB Atlas on Free Tier
Until you upgrade:
- keep the cluster on Free
- keep the database user as-is
- keep `IP Access List` working
- expect lower performance than `M10`, but the app can still launch correctly

## 6. Final Launch Checklist
- Open `/healthz`
- Open `/readyz`
- Test login
- Test add to cart
- Test checkout with IBAN upload
- Test admin order review
- Test product images from `/uploads`
- Test one coupon of each type
