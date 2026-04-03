# Melora Production Checklist

## Before Deploy
- Set a new strong `JWT_SECRET`.
- Set a new strong `JWT_REFRESH_SECRET`.
- Fill `backend/.env` from `backend/.env.example`.
- Fill `frontend/.env` from `frontend/.env.example`.
- Make sure `CLIENT_URL` points to the real storefront domain.
- Add `CLIENT_URLS` if you will use both `www` and non-`www`.
- Verify `storeEmail`, `iban`, and `accountHolder` from admin settings.

## Recommended Server Setup
- Run the backend behind `pm2` using [ecosystem.config.cjs](C:\Users\Lenovo\Desktop\Melora\luxbag\ecosystem.config.cjs).
- Put Nginx or a reverse proxy in front of the Node server.
- Enable HTTPS on the domain.
- Keep MongoDB Atlas IP rules updated for your server.
- Use [nginx.melora.conf.example](C:\Users\Lenovo\Desktop\Melora\luxbag\nginx.melora.conf.example) as a starting point.

## Health Checks
- API root: `GET /`
- Liveness: `GET /healthz`
- Readiness: `GET /readyz`

## Security
- Never upload `.env` files.
- Never upload `seed_output.txt` or temporary scripts.
- Keep admin credentials private and change them after first deployment.
- Restrict Atlas `IP Access List` to the server IP later when you are ready.

## Final Verification
- Test login, cart, checkout, IBAN upload, and admin order review.
- Test one coupon with percentage discount.
- Test one fixed-amount coupon in `₺`.
- Test one `Free Shipping` coupon.
- Verify images load from `/uploads`.
