# Assumptions and Design Decisions

## 1. Account Management

- Every newly created account starts with a balance of `0.00`.
- An account name is required and cannot contain only whitespace.
- An account must exist before a transaction or transfer can be performed against it.
- Account balances are managed by the backend and are updated through successful financial operations.
- The API does not expose account deletion or direct balance-editing operations.
- Account listing supports pagination, and the dashboard summary provides the total account count and combined account balance.

## 2. Monetary Values

- Monetary values are stored in PostgreSQL using `NUMERIC(19,2)`.
- Decimal.js is used for monetary calculations to avoid relying on JavaScript floating-point arithmetic for financial calculations.
- Transaction and transfer amounts must be greater than zero.
- Amounts with more than two decimal places are rejected.
- Monetary values are returned as strings where applicable to preserve their decimal representation.

## 3. Transaction Management

- Each transaction belongs to an existing account.
- A transaction type must be either `credit` or `debit`.
- Every transaction requires a reference ID.
- A transaction reference ID must be unique within its account.
- The same transaction reference ID can be used for a different account because the transaction uniqueness rule is scoped to the account.
- Transaction records are immutable after creation. The API does not expose transaction update or delete endpoints.
- A credit increases the account balance, while a debit decreases it.
- A debit is rejected when the account has insufficient funds.
- Failed transactions must not leave a balance change or a partially created ledger entry.

## 4. Balance Consistency and Atomicity

- Transaction creation and the corresponding account balance update occur within a single managed Sequelize database transaction.
- If an operation fails, the database transaction is rolled back.
- The account balance and its corresponding ledger entries must remain consistent.
- Balance changes are performed by backend business logic rather than by accepting a client-supplied resulting balance.

## 5. Transfers

- A transfer requires existing source and destination accounts.
- The source and destination accounts must be different.
- The transfer amount must be positive and contain no more than two decimal places.
- The source account must have sufficient funds.
- A successful transfer creates two ledger entries: a debit for the source account and a credit for the destination account.
- The transfer record, both ledger entries, and both account balance updates are handled atomically.
- If any part of a transfer fails, all changes belonging to that transfer are rolled back.
- Transfer records use a transfer reference ID subject to the implemented database uniqueness constraint.
- The paired ledger entries are associated with the transfer through the transfer relationship.
- A successful transfer moves funds between accounts without changing their combined balance.

## 6. Concurrency

- Database transactions and row-level locks protect account balance updates from conflicting operations.
- Transfer operations lock the involved account rows in a consistent order to reduce the risk of deadlocks.
- Balance validation and balance updates are performed within the database transaction.
- Concurrent operations must not allow an account to spend funds that are no longer available.
- If a concurrent operation cannot satisfy the business rules, it must fail without leaving partial financial changes.

## 7. Pagination and Sorting

- Account and transaction listing endpoints support the `page` and `limit` query parameters.
- The default page is `1`, and the default page size is `10`.
- Paginated responses include the current page, page size, total record count, and total page count.
- Account-specific and global transaction listings are sorted newest first.
- Pagination is handled by the backend rather than by fetching all transaction records and filtering them only in the frontend.

## 8. Validation and Error Handling

- Request data is validated before business operations are performed.
- Zod is used for request validation.
- Invalid request data, invalid or nonexistent account IDs, unsupported transaction types, invalid amounts, duplicate references, and insufficient balances are handled as errors.
- An application error class and centralized error middleware provide a common approach to error handling.
- Failed financial operations must not leave partial database changes.
- Exact HTTP status codes and response shapes should follow the implemented controllers and error middleware.

## 9. Database and Architecture

- PostgreSQL is the relational database.
- Sequelize is used for database access, migrations, and transaction management.
- The backend follows a feature-based modular monolith architecture.
- Business rules are handled in the service layer, while repositories handle database operations.
- Database constraints provide additional protection for data integrity.
- The frontend uses React, Vite, Axios, and TanStack Query to fetch API data and refresh affected views after successful financial operations.

## 10. Scope and Limitations

- The current application focuses on account creation and listing, account balances, transaction recording, transaction history, and transfers.
- Transaction update and delete operations are not exposed by the API.
- A transaction reversal workflow has not been established as part of the current implementation.
- Authentication and authorization are not included in the documented API scope established for this assessment.
- The application is designed to run locally using the documented environment variables, database migrations, and development commands.
