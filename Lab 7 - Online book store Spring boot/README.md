# BOOKVERSE

BOOKVERSE is a full-stack bookstore application with a React/Vite frontend and a MySQL-backed Spring Boot API.

## Requirements

- Java 17 or newer
- Maven 3.9+
- MySQL

## Installation

```bash
cd client
npm install
```

## Database setup

1. Start MySQL.
2. The application creates the database if the MySQL user can do so. Otherwise create a database named `bookverse`.
3. Set the environment variables below before starting Spring Boot (PowerShell uses `$env:NAME="value"`).

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bookverse
DB_USER=root
DB_PASSWORD=password
```

## Environment variables

Spring Boot reads these values from environment variables or `server/src/main/resources/application.properties` defaults:

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
mvn spring-boot:run
```

The Maven build also supports `mvn -B clean test` and `mvn -B package`. The API is mounted under `/api`, so its health endpoint is `http://localhost:5000/api/health`.

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
- Razorpay hooks handled when configured; payment creation returns HTTP 503 with setup instructions when credentials are absent

## Notes

- The frontend is configured to use `VITE_API_URL` when present; otherwise it defaults to `http://localhost:5000/api`.
- JWTs are accepted from `Authorization: Bearer <token>` and the `token` cookie. Passwords use BCrypt and are never included in user response objects.
- The startup seed creates the configured admin user and demo books when they do not already exist.
