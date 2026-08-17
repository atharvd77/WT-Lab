# VIT SGPA Calculator

A full-stack web app for VIT-style students to calculate, save, and download semester
SGPA results.

**Stack:** React.js (frontend) · Node.js + Express (backend) · MySQL (database)

---

## Features

- Secure signup/login with **email + strong-password validation** and **bcrypt password hashing**
- JWT-based authenticated sessions
- Four default subjects pre-loaded: **OOP, DBMS, CN, OS** (4 credits each)
- Add unlimited custom subjects with their own credit values
- Automatic **Final Marks = 30% MSE + 70% ESE** calculation
  (MSE is entered out of 50, ESE out of 100 — both scaled to their respective weight)
- Grade & grade-point assignment:

  | Marks   | Grade | Points |
  |---------|-------|--------|
  | 91–100  | A+    | 10     |
  | 81–90   | A     | 9      |
  | 71–80   | B+    | 8      |
  | 61–70   | B     | 7      |
  | 51–60   | C     | 6      |
  | 41–50   | D     | 5      |
  | ≤40     | F     | 0      |

- Credit-weighted **SGPA** calculation: `SGPA = Σ(credits × grade point) / Σ(credits)`
- Structured results table (subject, MSE, ESE, final marks, grade, credits)
- Downloadable **PDF** of the result (generated server-side with `pdfkit`)
- Result history saved per student
- Clean, responsive UI (mobile → desktop)

---

## Project structure

```
vit-sgpa-app/
├── backend/          Node.js + Express API
│   ├── config/db.js       MySQL connection pool
│   ├── models/schema.sql  Database schema
│   ├── middleware/auth.js JWT auth middleware
│   ├── routes/auth.js     Signup / login
│   ├── routes/results.js  Calculate / save / history / PDF
│   ├── utils/grade.js     Grading + SGPA logic
│   ├── utils/pdf.js       PDF generation
│   └── server.js
└── frontend/          React app
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.js
        ├── components/ (Topbar, SubjectTable, PrivateRoute)
        ├── pages/ (Login, Signup, Dashboard)
        └── styles/global.css
```

---

## 1. Prerequisites

- Node.js 18+ and npm
- MySQL 8+ (or MariaDB) running locally or remotely

---

## 2. Database setup

Log into MySQL and run the schema file:

```bash
mysql -u root -p < backend/models/schema.sql
```

This creates the `vit_sgpa_db` database with `users`, `results`, and `result_subjects` tables.

---

## 3. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set DB_PASSWORD, JWT_SECRET, etc.
npm install
npm run dev        # starts on http://localhost:5000
```

Environment variables (`backend/.env`):

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vit_sgpa_db
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
```

---

## 4. Frontend setup

```bash
cd frontend
cp .env.example .env
# edit .env if your API runs on a different host/port
npm install
npm start           # starts on http://localhost:3000
```

---

## 5. API reference

| Method | Endpoint                | Auth | Description                          |
|--------|--------------------------|------|---------------------------------------|
| POST   | `/api/auth/signup`       | No   | Create account (name, email, password, regNumber) |
| POST   | `/api/auth/login`        | No   | Log in, returns JWT                  |
| POST   | `/api/results/calculate` | Yes  | Compute SGPA without saving          |
| POST   | `/api/results/save`      | Yes  | Compute SGPA and persist to DB       |
| GET    | `/api/results/history`   | Yes  | List saved results for the logged-in user |
| GET    | `/api/results/:id`       | Yes  | Fetch one saved result + its subjects |
| POST   | `/api/results/pdf`       | Yes  | Generate & stream a PDF of the result |

All authenticated routes require an `Authorization: Bearer <token>` header.

### Example request body (`/api/results/calculate`)

```json
{
  "semesterLabel": "Semester 3",
  "subjects": [
    { "name": "OOP", "credits": 4, "mse": 45, "ese": 88 },
    { "name": "DBMS", "credits": 4, "mse": 40, "ese": 75 },
    { "name": "CN", "credits": 4, "mse": 38, "ese": 70 },
    { "name": "OS", "credits": 4, "mse": 42, "ese": 80 }
  ]
}
```

---

## 6. Security notes

- Passwords are hashed with **bcrypt** (cost factor 12) before being stored — plaintext
  passwords are never persisted.
- Server-side validation (via `express-validator`) enforces email format and a strong
  password policy (8+ characters, upper/lowercase, digit, special character) in addition
  to client-side checks.
- JWTs are signed with a server-side secret and expire after 7 days by default.
- Parameterized SQL queries (via `mysql2`) protect against SQL injection.

---

## 7. Deployment tips

- Set a strong, random `JWT_SECRET` in production and never commit `.env` files.
- Point `CLIENT_ORIGIN` (backend) and `REACT_APP_API_BASE_URL` (frontend) at your deployed
  URLs.
- Run `npm run build` in `frontend/` to produce a static production bundle you can serve
  via any static host (Netlify, Vercel, Nginx, etc.), and deploy `backend/` to any Node
  host (Render, Railway, EC2, etc.) with a managed MySQL instance.
