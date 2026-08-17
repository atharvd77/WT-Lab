# 🚀 VIT SGPA Calculator - Complete Setup Guide

## Prerequisites

Before starting, ensure you have these installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL Server** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** (optional, for version control)

---

## Step 1: Verify Installations

Open PowerShell and run:

```powershell
node --version
npm --version
```

For MySQL, open Command Prompt and run:

```cmd
mysql --version
```

---

## Step 2: Setup MySQL Database

### Option A: Using MySQL Command Line (Recommended)

1. **Start MySQL Server** (if not already running)
   - Windows: Open MySQL Command Line Client from Start Menu
   - Or run: `mysql -u root -p` and enter your MySQL password

2. **Create Database**
   - Paste the entire content from `backend/models/schema.sql` into MySQL Command Line
   - Press Enter to execute

3. **Verify Database Created**
   ```sql
   SHOW DATABASES;
   USE vit_sgpa_db;
   SHOW TABLES;
   ```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Create new query tab
3. Copy content from `backend/models/schema.sql`
4. Execute (Ctrl + Shift + Enter)

---

## Step 3: Configure Backend Environment

1. **Open** `backend/.env` file in VS Code
2. **Update these values** with your MySQL credentials:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root              # Your MySQL username
DB_PASSWORD=              # Your MySQL password (leave empty if none)
DB_NAME=vit_sgpa_db

# JWT Secret (keep it secure in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CLIENT_ORIGIN=http://localhost:3000
```

---

## Step 4: Install Backend Dependencies

1. **Open PowerShell** and navigate to project:

   ```powershell
   cd d:\TY\Sem 1\WT\Lab 3 SGPA Calculator
   cd backend
   ```

2. **Install dependencies**:

   ```powershell
   npm install
   ```

3. **Wait for completion** - This installs:
   - Express.js (web framework)
   - MySQL2 (database driver)
   - bcryptjs (password hashing)
   - jsonwebtoken (JWT auth)
   - pdfkit (PDF generation)
   - nodemon (auto-reload for development)

---

## Step 5: Install Frontend Dependencies

1. **Open new PowerShell window** and navigate to frontend:

   ```powershell
   cd d:\TY\Sem 1\WT\Lab 3 SGPA Calculator
   cd frontend
   ```

2. **Install dependencies**:

   ```powershell
   npm install
   ```

3. **Wait for completion** - This installs:
   - React 18.3
   - React Router DOM
   - Axios (HTTP client)
   - React Scripts

---

## Step 6: Start Development Servers

### Start Backend

In PowerShell (from `backend` folder):

```powershell
npm run dev
```

Expected output:

```
🚀 VIT SGPA Calculator API listening on port 5000
✅ Connected to MySQL database: vit_sgpa_db
```

### Start Frontend

In new PowerShell window (from `frontend` folder):

```powershell
npm start
```

This will:

- Compile React app
- Open browser automatically to `http://localhost:3000`
- Show any compilation warnings

---

## Step 7: Verify Setup

### Test Backend API

Open browser and visit:

```
http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "VIT SGPA Calculator API is running."
}
```

### Test Frontend

- Frontend should be running at `http://localhost:3000`
- You should see the login page
- Create an account and test the SGPA calculator

---

## Troubleshooting

### ❌ "npm command not found"

- Node.js not installed or PATH not set
- **Solution**: Reinstall Node.js from https://nodejs.org/

### ❌ "MySQL connection error"

- MySQL server not running
- Wrong credentials in `.env`
- Database not created
- **Solutions**:
  1. Start MySQL Server
  2. Verify `.env` credentials match your MySQL setup
  3. Run `schema.sql` to create database

### ❌ "Port 5000 already in use"

- Another process is using port 5000
- **Solution**: Change `PORT=5000` to `PORT=5001` in `.env`

### ❌ "Cannot find module..."

- Dependencies not installed
- **Solution**: Run `npm install` in that folder

### ❌ "React app won't load"

- Backend not running
- CORS misconfiguration
- **Solution**: Ensure backend is running on port 5000

### ❌ "npm ERR! peer dep missing"

- Babel/React version conflict
- **Solution**: Run `npm install` again or delete `node_modules` and run `npm install`

---

## Project Structure

```
Lab 3 SGPA Calculator/
├── backend/
│   ├── .env                 # Configuration (DATABASE CREDENTIALS HERE)
│   ├── server.js            # Main server file
│   ├── package.json
│   ├── config/
│   │   └── db.js            # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── models/
│   │   └── schema.sql       # Database schema
│   ├── routes/
│   │   ├── auth.js          # Signup/Login endpoints
│   │   └── results.js       # SGPA calculation endpoints
│   └── utils/
│       ├── grade.js         # Grading logic
│       └── pdf.js           # PDF generation
│
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx
│       ├── index.js
│       ├── api/
│       │   └── axios.js     # API client configuration
│       ├── components/
│       ├── context/
│       │   └── AuthContext.js
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   └── Dashboard.jsx
│       └── styles/
│           └── global.css
│
└── README.md
```

---

## Development Commands

### Backend

```powershell
cd backend

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

### Frontend

```powershell
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Results

- `POST /api/results/calculate` - Calculate SGPA
- `POST /api/results/save` - Save result to database
- `GET /api/results/history` - Get user's result history
- `GET /api/results/download/:resultId` - Download result as PDF

---

## Next Steps

1. ✅ Complete setup as per this guide
2. 🔧 Test all features (signup, login, calculate SGPA, download PDF)
3. 📱 Test on different screen sizes (responsive design)
4. 🚀 Deploy to a live server when ready

---

## Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Verify `.env` configuration
3. Ensure MySQL is running
4. Check browser console for errors (F12)
5. Check terminal output for error messages

**Happy coding! 🎉**
