# FRANKCOIN — Telegram Tap Bot on TON

A production-ready starter to run a TON-based tap bot (**FRANKCOIN**) with premium purchases, referrals, leaderboards, and an admin panel (stats, grant premium, **withdraw TON**).

## Stack
- **Backend**: Node.js, Express, Telegraf, PostgreSQL, JWT
- **TON**: `@ton/ton`, `@ton/crypto` (custodial payout option)
- **WebApp**: React (Vite), i18n (EN/DE/UK/RU), glassy blue UI with coin PNG
- **Docker**: Postgres, Backend API, WebApp (Nginx)

---

## Quick Start (Docker)

1. Copy `.env.sample` to `.env` in **backend/** and fill:
```
TELEGRAM_BOT_TOKEN=123:ABC
WEBAPP_URL=https://your-domain.app           # public URL where webapp is served
JWT_SECRET=change-me-long-random
ADMIN_PASSWORD=super-secret
CUSTODIAL_MNEMONIC="word1 ... word24"        # OPTIONAL: server-side payouts
BOT_USERNAME=frankcoin_bot
DATABASE_URL=postgres://postgres:postgres@db:5432/frankcoin
```

2. Create database & tables:
```bash
docker compose up -d db
# wait ~5s
docker compose exec -T db psql -U postgres -d frankcoin -f /migrations/migrations.sql
```

3. Start backend + webapp:
```bash
docker compose up -d --build backend webapp
```

4. Set Telegram bot **webapp start button** (optional) and share `/start` link with friends.
   The bot automatically sends a button to open the WebApp.

---

## Local Development

- **DB**: `docker compose up -d db`
- **Backend**:
  ```bash
  cd backend
  npm i
  npm run dev
  ```
- **WebApp**:
  ```bash
  cd webapp
  npm i
  npm run dev
  ```

---

## Admin Panel
Open the WebApp and click **Admin** tab. Login with `ADMIN_PASSWORD`.
- **Stats**: users, active premium, revenue (TON)
- **Grant Premium**: set days for any TG user ID
- **Withdraw TON**: send TON to target address (custodial mode only)

> Safer alternative: disable server payouts and instead implement **TonConnect** UX for the owner to approve payouts from their wallet (non‑custodial).

---

## Notes
- Premium plan is **4 TON / month** → x5 tap rate + 12h auto-click toggleable.
- Referral: invite friends to get **15,000 coins** + **10%** of their earnings.
- Leaderboard: global/weekly/today.
- The WebApp uses `public/coin.png` as the tap button image.

---
