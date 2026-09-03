# BOOKVERSE

BOOKVERSE is a full-stack bookstore application with a React/Vite frontend and a MySQL-backed Express API.

## Requirements

- Node.js
- npm
- MySQL

## Installation

```bash
cd server
npm install
```

```bash
cd client
npm install
```

## Database setup

1. Start MySQL.
2. Create a database named `bookverse`.
3. Update your database credentials in `server/.env`.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bookverse
DB_USER=root
DB_PASSWORD=password
```

## Environment variables

Create or edit `server/.env` with the following values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bookverse
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=bookverse-dev-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
ADMIN_EMAIL=admin@bookverse.com
ADMIN_PASSWORD=Admin@12345
```

## Running backend

```bash
cd server
node server.js
```

## Running frontend

```bash
cd client
npm run dev
```

## URLs

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Features included

- User registration and login
- Book catalogue with search, category filters, and sorting
- Book detail pages and reviews
- Cart and checkout flow
- Orders and account management
- Admin dashboard for overview and inventory
- Razorpay hooks handled when configured

## Notes

- The frontend is configured to use `VITE_API_URL` when present; otherwise it defaults to `http://localhost:5000/api`.
- If Razorpay credentials are missing, the app still runs without crashing and shows a clear error when payment is attempted.
