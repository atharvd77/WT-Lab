# VIT Semester Result / SGPA Calculator — Spring Boot Edition

A full-stack web application for VIT students to securely log in, enter subject marks (MSE + ESE), compute final marks and grades, calculate SGPA, and download a PDF result sheet.

**Stack:** React 18 · Vite · Java 17 · Spring Boot 3.3.4 · Spring Data JPA · MySQL · Spring Security · JWT · BCrypt · OpenPDF

The application separates the React frontend from a Spring Boot REST API. Student accounts and saved semester results are persisted in MySQL.

## Aim

To design and develop a full-stack web-based SGPA Calculator that allows students to securely enter semester marks and credits, automatically calculate subject-wise grades and credit-weighted SGPA, save semester results, view result history, and download results as a PDF.

## Objectives

1. Develop a responsive and user-friendly SGPA calculator using React.js and Vite.
2. Automatically calculate final marks, grades, grade points, and SGPA using the VIT grading system.
3. Provide secure student registration and login using Spring Security, BCrypt password hashing, and JWT-based authentication.
4. Allow authenticated students to save and view semester results stored in a MySQL database through Spring Data JPA and Hibernate.
5. Generate downloadable semester result PDFs on the server using OpenPDF.
6. Apply client-side and server-side validation, DTOs, JPA repositories, and authenticated API access to improve application security and reliability.

## Software Requirements

| Category                | Requirement                                                |
| ----------------------- | ---------------------------------------------------------- |
| Operating system        | Windows                                                    |
| Frontend                | React 18, HTML5, CSS3, JavaScript, Vite                    |
| Backend                 | Java 17, Spring Boot 3.3.4, Spring Web                     |
| Persistence             | Spring Data JPA, Hibernate ORM                             |
| Database                | MySQL 8+ or MariaDB                                        |
| Authentication          | Spring Security, JSON Web Token (JJWT)                     |
| Password security       | BCryptPasswordEncoder                                      |
| PDF generation          | OpenPDF                                                    |
| Validation              | Jakarta Bean Validation via Spring Boot Starter Validation |
| Database driver         | MySQL Connector/J                                          |
| Package/build tools     | npm and Maven 3.8+                                         |
| Development environment | Visual Studio Code                                         |
| Version control         | Git and GitHub                                             |
| Supported browsers      | Google Chrome, Microsoft Edge, Mozilla Firefox             |

---

## Features

- Secure signup/login: email format validation + strong password rules (min 8 chars, upper + lower case, number, special character) enforced with Jakarta Bean Validation, passwords hashed with **BCrypt**, sessions via **JWT** (stateless, `Authorization: Bearer <token>`).
- Default subjects pre-loaded: **OOP, DBMS, CN, OS** (4 credits each).
- Add unlimited custom subjects with their own credit values.
- Automatic calculation:
  - `Final Marks = 0.30 × MSE + 0.70 × ESE`
  - Grade bands: 91–100 → A+ (10), 81–90 → A (9), 71–80 → B+ (8), 61–70 → B (7), 51–60 → C (6), 41–50 → D (5), ≤40 → F (0)
  - `SGPA = Σ(credits × grade point) / Σ(credits)`
- Results table with subject, MSE, ESE, final marks, grade, grade point, credits, and overall SGPA.
- Save results to your account (`results` table) and fetch history.
- One-click PDF download of the result sheet, generated server-side with **OpenPDF**.
- Clean, responsive UI that works on mobile, tablet, and desktop.

---

## Project Structure

```
vit-sgpa-app-springboot/
├── backend/                              # Spring Boot (Java 17, Maven)
│   ├── pom.xml
│   ├── sql/schema.sql                    # Reference schema (auto-created by JPA too)
│   └── src/main/
│       ├── java/com/vit/sgpa/
│       │   ├── SgpaCalculatorApplication.java
│       │   ├── config/SecurityConfig.java        # Spring Security + CORS
│       │   ├── security/                         # JwtUtil, JwtAuthFilter, AuthenticatedUser
│       │   ├── entity/                            # User, Result (JPA entities)
│       │   ├── repository/                        # UserRepository, ResultRepository
│       │   ├── dto/                                # Request/response DTOs
│       │   ├── service/                            # AuthService, ResultService, PdfService
│       │   ├── controller/                         # AuthController, ResultController, HealthController
│       │   ├── util/GradeCalculator.java           # Grading + SGPA formula
│       │   └── exception/                          # ApiException, GlobalExceptionHandler
│       └── resources/
│           ├── application.properties               # Edit this with your MySQL creds
│           └── application-example.properties
└── frontend/                              # React 18 + Vite (same UI as before)
    ├── src/
    │   ├── components/   # Navbar, Login, Signup, Dashboard, SubjectForm, ResultTable
    │   ├── context/AuthContext.jsx
    │   ├── api.js
    │   ├── App.jsx, main.jsx, index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

---

## Prerequisites

Install these once, before opening the project in VS Code:

| Tool             | Version            | Purpose                               |
| ---------------- | ------------------ | ------------------------------------- |
| **JDK**          | 17 or newer        | Compiles/runs the Spring Boot backend |
| **Maven**        | 3.8+               | Builds the backend (`mvn`)            |
| **Node.js**      | 18+ (includes npm) | Runs the React frontend               |
| **MySQL Server** | 8.x                | Database                              |

Quick install commands:

```bash
# macOS (Homebrew)
brew install openjdk@17 maven node mysql

# Windows (winget)
winget install EclipseAdoptium.Temurin.17.JDK
winget install Apache.Maven
winget install OpenJS.NodeJS.LTS
winget install Oracle.MySQL

# Ubuntu/Debian
sudo apt update && sudo apt install openjdk-17-jdk maven nodejs npm mysql-server
```

Verify installs:

```bash
java -version    # should show 17+
mvn -v           # should show Maven 3.8+
node -v          # should show 18+
mysql --version
```

---

## 1. Database Setup (MySQL)

The backend uses `spring.jpa.hibernate.ddl-auto=update`, so **Hibernate auto-creates the `users` and `results` tables for you** on first run — you only need to create the database itself (or let the JDBC URL's `createDatabaseIfNotExist=true` do it).

Simplest option — just make sure your MySQL server is running; the app will create `vit_sgpa_db` automatically.

If you'd rather set it up manually:

```bash
mysql -u root -p < backend/sql/schema.sql
```

---

## 2. Opening the Project in VS Code

1. **Install these VS Code extensions** (VS Code will prompt you automatically thanks to the included `.vscode/extensions.json`, or install manually from the Extensions panel):
   - **Extension Pack for Java** (`vscjava.vscode-java-pack`) — Java language support, debugger, test runner, Maven integration
   - **Spring Boot Extension Pack** (`vmware.vscode-spring-boot`) — Spring Boot dashboard, run/debug support, `application.properties` autocomplete
   - (Frontend) **ESLint**, **Prettier**, and an ES7+ React snippets extension are recommended too

2. **Open the whole project folder** in VS Code:

   ```bash
   code vit-sgpa-app-springboot
   ```

   Because both `backend/` and `frontend/` have their own `.vscode` settings, VS Code will pick up the right tooling for each once you navigate into files inside them. (You can also open just `backend/` or just `frontend/` as separate windows if you prefer working on one at a time.)

3. VS Code's Java extension will detect `backend/pom.xml` automatically and start resolving Maven dependencies (this can take a minute or two the first time — watch the bottom status bar for "Java: Loading Java Projects...").

---

## 3. Configure and Run the Backend (Spring Boot)

1. Open `backend/src/main/resources/application.properties` and set your MySQL credentials and a JWT secret:

   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   app.jwt.secret=replace_with_a_long_random_secret_at_least_32_characters
   ```

   (`application-example.properties` in the same folder shows the full set of values if you'd rather manage this as a separate profile/env instead of editing the tracked file directly.)

2. **Run it from VS Code** — open `SgpaCalculatorApplication.java` and click the **Run** (▶) button that appears above the `main` method, or use the **Spring Boot Dashboard** panel (installed with the Spring Boot Extension Pack) and hit the play icon next to `sgpa-calculator`.

   **Or from the terminal:**

   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. Confirm it started: open `http://localhost:8080/api/health` in a browser — you should see:
   ```json
   { "status": "ok", "message": "VIT SGPA Calculator API is running." }
   ```

---

## 4. Configure and Run the Frontend (React + Vite)

Open a **second terminal** in VS Code (Terminal → New Terminal):

```bash
cd frontend
npm install
cp .env.example .env      # points VITE_API_BASE_URL at http://localhost:8080/api
npm run dev
```

Visit `http://localhost:3000`. Vite is also configured to proxy `/api` calls to `http://localhost:8080` during development, so the app works even without the `.env` file.

---

## 5. Using the App

1. Sign up with a name, email, and a password containing an uppercase letter, lowercase letter, number, and special character.
2. You'll land on the dashboard with OOP, DBMS, CN, and OS pre-filled (4 credits each) — enter MSE/ESE marks.
3. Add more subjects with **+ Add Subject** if needed.
4. Click **Calculate SGPA** to see the results table and SGPA.
5. Click **Save Result** to persist it to the database, or **Download as PDF** to get a result sheet.

---

## 6. API Reference

| Method | Endpoint                 | Auth | Description                                   |
| ------ | ------------------------ | ---- | --------------------------------------------- |
| GET    | `/api/health`            | No   | Health check                                  |
| POST   | `/api/auth/signup`       | No   | Register a new student account                |
| POST   | `/api/auth/login`        | No   | Log in and receive a JWT                      |
| POST   | `/api/results/calculate` | Yes  | Compute final marks, grades, SGPA (no save)   |
| POST   | `/api/results/save`      | Yes  | Compute and persist a result to the database  |
| GET    | `/api/results/history`   | Yes  | List all saved results for the logged-in user |
| POST   | `/api/results/pdf`       | Yes  | Generate and stream a PDF of the result sheet |

All authenticated routes require an `Authorization: Bearer <token>` header (the frontend handles this automatically once logged in).

---

## 7. Grading Reference

| Final Marks | Grade | Grade Point |
| ----------- | ----- | ----------- |
| 91–100      | A+    | 10          |
| 81–90       | A     | 9           |
| 71–80       | B+    | 8           |
| 61–70       | B     | 7           |
| 51–60       | C     | 6           |
| 41–50       | D     | 5           |
| 0–40        | F     | 0           |

`Final Marks = (MSE × 0.30) + (ESE × 0.70)`
`SGPA = Σ(credit × grade point) ÷ Σ(credit)`

Adjust `backend/src/main/java/com/vit/sgpa/util/GradeCalculator.java` if your institution uses a different scale.

---

## 8. Building a Production Jar

```bash
cd backend
mvn clean package
java -jar target/vit-sgpa-backend.jar
```

For the frontend:

```bash
cd frontend
npm run build     # outputs static files to frontend/dist
```

Serve `frontend/dist` from any static host, or copy it into `backend/src/main/resources/static` before `mvn package` to have Spring Boot serve both frontend and API from one process.

---

## Notes & Suggested Improvements

- `ddl-auto=update` is convenient for development; for production, switch to `validate` or `none` and manage schema changes with a migration tool (Flyway/Liquibase).
- Store `app.jwt.secret` and DB credentials as environment variables or in a Spring profile that isn't committed to source control.
- Consider adding rate limiting on `/api/auth/**` to guard against brute-force login attempts.
- CORS allowed origins are read from `app.cors.allowed-origins` in `application.properties` — update this if you deploy the frontend to a different domain.
