# Transaction Ledger API

A full-stack transaction ledger application built with Node.js, Express.js, PostgreSQL, Sequelize, and React. The application supports account management, credit and debit transactions, money transfers, transaction history, pagination, and dashboard summaries.

## Features

- Create and view accounts.
- Initialize new accounts with a zero balance.
- Record credit and debit transactions.
- Transfer money between accounts.
- Display transaction history with the newest transactions first.
- Prevent duplicate transaction reference IDs for the same account.
- Prevent debits and transfers when the source account has insufficient funds.
- Process balance updates and transaction records atomically.
- Support paginated account and transaction listings.
- Display dashboard summaries and account balances.
- Validate incoming requests and return meaningful error responses.
- Prevent transaction editing and deletion through the available API.

## Technology Stack

### Backend

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Decimal.js for monetary calculations
- Zod for request validation
- Helmet and CORS
- Node.js built-in test runner
- Supertest for API testing

### Frontend

- React
- Vite
- React Router
- TanStack React Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Lucide React

## Project Structure

```text
transaction-project/
├── client/
│   ├── src/
│   ├── package.json
│   └── ...
├── server/
│   ├── src/
│   │   ├── database/
│   │   │   └── migrations/
│   │   └── ...
│   ├── package.json
│   └── ...
├── README.md
├── API_DOCUMENTATION.md
└── ASSUMPTIONS.md
```

The backend uses a feature-based modular monolith architecture, separating application features and responsibilities into appropriate modules.

## Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- Git, if cloning the repository

Development versions used:

- Node.js: v24.21.0
- npm: 11.19.0
- PostgreSQL: 18.6

## Installation and Setup

### 1. Get the project

If the project is hosted in a Git repository:

```bash
git clone <repository-url>
cd transaction-project
```

If you already have the project locally, open its root directory.

### 2. Configure PostgreSQL

Create a PostgreSQL database named:

```text
transaction_management
```

Ensure PostgreSQL is running and that you have the required database credentials.

### 3. Configure backend environment variables

Navigate to the backend directory:

```bash
cd server
```

Create a `.env` file using `.env.example` as a reference.

Use the following configuration, replacing the password with your local PostgreSQL password:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=transaction_management
DB_USER=postgres
DB_PASSWORD=your_local_postgres_password
```

Ensure the variable names match the backend configuration.

**Security:** Keep `.env` private. Do not commit real credentials or passwords to the repository.

### 4. Install backend dependencies

From the `server` directory:

```bash
npm install
```

### 5. Run database migrations

From the `server` directory:

```bash
npx sequelize-cli db:migrate
```

This applies the configured database migrations.

Verify that the required tables have been created before starting the application.

### 6. Start the backend

For development:

```bash
npm run dev
```

To start without Nodemon:

```bash
npm start
```

The backend runs on the configured port, which defaults to `3000` when using the provided environment configuration.

Health check endpoint:

```http
GET /health
```

### 7. Configure and start the frontend

Open a second terminal and navigate to the client directory from the project root:

```bash
cd client
```

Install the frontend dependencies:

```bash
npm install
```

Configure the frontend API base URL according to the environment variable read by `client/src/lib/axios.js`. For local development, it should point to the backend server.

Start the frontend development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in the terminal.

## API Overview

The backend provides endpoints for accounts, transactions, and transfers.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check server health |
| GET | `/api/accounts` | List accounts with pagination |
| GET | `/api/accounts/all` | Retrieve all accounts |
| GET | `/api/accounts/summary` | Retrieve account summary |
| POST | `/api/accounts` | Create an account |
| GET | `/api/accounts/:id` | Retrieve account details |
| POST | `/api/accounts/:id/transactions` | Create a credit or debit transaction |
| GET | `/api/accounts/:id/transactions` | Retrieve an account's transaction history |
| GET | `/api/transactions` | List transactions across accounts |
| POST | `/api/transfers` | Transfer money between accounts |

See `API_DOCUMENTATION.md` for request bodies, query parameters, response examples, and error handling details.

## Business Rules and Data Integrity

- New accounts start with a zero balance.
- Monetary values use PostgreSQL `NUMERIC(19,2)`.
- Transaction amounts must be positive and support up to two decimal places.
- A debit cannot exceed the available account balance.
- Transaction reference IDs must be unique per account.
- A transfer requires two different, existing accounts.
- A transfer creates corresponding debit and credit transaction records.
- Balance updates and related transaction records are processed within database transactions.
- Failed operations must not leave partial balance updates or ledger entries.
- Transaction records cannot be edited or deleted through the provided API.
- Transaction listings support pagination and newest-first ordering.

See `ASSUMPTIONS.md` for detailed business rules, constraints, and design decisions.

## Running Backend Tests

Navigate to the backend directory:

```bash
cd server
```

Run the automated tests:

```bash
npm test
```

The backend test command uses Node.js's built-in test runner. Supertest is available for HTTP endpoint testing.

Ensure your test environment and database configuration are set up correctly before running tests.

## Frontend Build and Lint

Navigate to the client directory:

```bash
cd client
```

Create a production build:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Preview the production build locally:

```bash
npm run preview
```

## Error Handling

The application validates incoming requests and returns appropriate HTTP status codes for validation failures, missing accounts, insufficient balances, duplicate references, and other unsuccessful operations.

## Documentation

- `README.md` — Project overview, installation, configuration, and execution.
- `API_DOCUMENTATION.md` — API endpoints, request formats, parameters, and responses.
- `ASSUMPTIONS.md` — Business rules, database constraints, and design decisions.

## License

This project was developed for the Transaction Ledger API assessment. The backend `package.json` currently specifies the ISC license field. Confirm the intended licensing terms before distributing the project.
