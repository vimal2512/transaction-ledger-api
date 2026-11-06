import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import request from "supertest";

import app from "../src/app.js";

test("GET /health returns 200 and a success response", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "Application is running",
  });
});

test("POST /api/accounts creates an account with zero balance", async () => {
  const response = await request(app)
    .post("/api/accounts")
    .send({ name: "Automated Test Account" });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.name, "Automated Test Account");
  assert.equal(response.body.data.balance, "0.00");
  assert.ok(response.body.data.id);
});

test("POST transaction rejects an invalid transaction type", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Invalid Type Test Account" });

  const accountId = accountResponse.body.data.id;

  const response = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send({
      type: "transfer",
      amount: "10.00",
      referenceId: `INVALID-TYPE-${crypto.randomUUID()}`,
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

test("POST transaction rejects a zero amount", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Zero Amount Test Account" });

  const accountId = accountResponse.body.data.id;

  const response = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send({
      type: "credit",
      amount: "0.00",
      referenceId: `ZERO-AMOUNT-${crypto.randomUUID()}`,
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

test("POST debit transaction rejects insufficient balance", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Insufficient Balance Test" });

  const accountId = accountResponse.body.data.id;

  const response = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send({
      type: "debit",
      amount: "100.00",
      referenceId: `INSUFFICIENT-${crypto.randomUUID()}`,
    });

  assert.equal(response.status, 422);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, "INSUFFICIENT_BALANCE");
});

test("POST transaction rejects a duplicate reference ID", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Duplicate Reference Test" });

  const accountId = accountResponse.body.data.id;

  const transaction = {
    type: "credit",
    amount: "50.00",
    referenceId: `DUPLICATE-${crypto.randomUUID()}`,
  };

  const firstResponse = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send(transaction);

  assert.equal(firstResponse.status, 201);

  const secondResponse = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send(transaction);

  assert.equal(secondResponse.status, 409);
  assert.equal(secondResponse.body.success, false);
  assert.equal(
    secondResponse.body.error.code,
    "DUPLICATE_REFERENCE"
  );
});

test("POST /api/transfers moves money between two accounts", async () => {
  const uniqueReference = `TRANSFER-TEST-${crypto.randomUUID()}`;

  const sourceResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Transfer Source Test" });

  const destinationResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Transfer Destination Test" });

  assert.equal(sourceResponse.status, 201);
  assert.equal(destinationResponse.status, 201);

  const sourceAccountId = sourceResponse.body.data.id;
  const destinationAccountId = destinationResponse.body.data.id;

  const creditResponse = await request(app)
    .post(`/api/accounts/${sourceAccountId}/transactions`)
    .send({
      type: "credit",
      amount: "200.00",
      referenceId: `TRANSFER-FUND-${crypto.randomUUID()}`,
    });

  assert.equal(creditResponse.status, 201);

  const transferResponse = await request(app)
    .post("/api/transfers")
    .send({
      sourceAccountId,
      destinationAccountId,
      amount: "75.00",
      referenceId: uniqueReference,
    });

  assert.equal(transferResponse.status, 201);
  assert.equal(transferResponse.body.success, true);
  assert.equal(
    transferResponse.body.data.balances.sourceAccountBalance,
    "125.00"
  );
  assert.equal(
    transferResponse.body.data.balances.destinationAccountBalance,
    "75.00"
  );
});

test("POST /api/transfers rejects insufficient balance", async () => {
  const sourceResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Transfer Insufficient Source" });

  const destinationResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Transfer Insufficient Destination" });

  assert.equal(sourceResponse.status, 201);
  assert.equal(destinationResponse.status, 201);

  const sourceAccountId = sourceResponse.body.data.id;
  const destinationAccountId = destinationResponse.body.data.id;

  const response = await request(app)
    .post("/api/transfers")
    .send({
      sourceAccountId,
      destinationAccountId,
      amount: "100.00",
      referenceId: `TRANSFER-INSUFFICIENT-${crypto.randomUUID()}`,
    });

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, "INSUFFICIENT_BALANCE");

  const sourceAfter = await request(app).get(
    `/api/accounts/${sourceAccountId}`
  );

  const destinationAfter = await request(app).get(
    `/api/accounts/${destinationAccountId}`
  );

  assert.equal(sourceAfter.body.data.balance, "0.00");
  assert.equal(destinationAfter.body.data.balance, "0.00");
});

test("POST /api/transfers rejects a duplicate transfer reference", async () => {
  const sourceResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Transfer Duplicate Source" });

  const destinationResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Transfer Duplicate Destination" });

  assert.equal(sourceResponse.status, 201);
  assert.equal(destinationResponse.status, 201);

  const sourceAccountId = sourceResponse.body.data.id;
  const destinationAccountId = destinationResponse.body.data.id;

  const creditResponse = await request(app)
    .post(`/api/accounts/${sourceAccountId}/transactions`)
    .send({
      type: "credit",
      amount: "200.00",
      referenceId: `TRANSFER-DUPLICATE-FUND-${crypto.randomUUID()}`,
    });

  assert.equal(creditResponse.status, 201);

  const transfer = {
    sourceAccountId,
    destinationAccountId,
    amount: "50.00",
    referenceId: `TRANSFER-DUPLICATE-${crypto.randomUUID()}`,
  };

  const firstResponse = await request(app)
    .post("/api/transfers")
    .send(transfer);

  assert.equal(firstResponse.status, 201);

  const secondResponse = await request(app)
    .post("/api/transfers")
    .send(transfer);

  assert.equal(secondResponse.status, 409);
  assert.equal(
    secondResponse.body.error.code,
    "DUPLICATE_TRANSFER_REFERENCE"
  );
});


test("POST transaction saves and returns an optional description", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Description Test Account" });

  assert.equal(accountResponse.status, 201);

  const accountId = accountResponse.body.data.id;
  const description = "Monthly salary";

  const response = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send({
      type: "credit",
      amount: "100.00",
      referenceId: `DESCRIPTION-${crypto.randomUUID()}`,
      description,
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.description, description);

  const historyResponse = await request(app)
    .get(`/api/accounts/${accountId}/transactions`);

  assert.equal(historyResponse.status, 200);
  assert.equal(
    historyResponse.body.data.transactions[0].description,
    description
  );
});



test("GET account returns 404 for a valid but nonexistent account ID", async () => {
  const nonexistentAccountId = crypto.randomUUID();

  const response = await request(app)
    .get(`/api/accounts/${nonexistentAccountId}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, "ACCOUNT_NOT_FOUND");
});

test("GET transaction history rejects invalid pagination parameters", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Invalid Pagination Test" });

  assert.equal(accountResponse.status, 201);

  const accountId = accountResponse.body.data.id;

  const response = await request(app)
    .get(`/api/accounts/${accountId}/transactions?page=0&limit=101`);

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});


test("Transaction update and delete endpoints are not exposed", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Immutability Test Account" });

  assert.equal(accountResponse.status, 201);

  const accountId = accountResponse.body.data.id;

  const transactionResponse = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send({
      type: "credit",
      amount: "100.00",
      referenceId: `IMMUTABILITY-${crypto.randomUUID()}`,
      description: "Initial deposit",
    });

  assert.equal(transactionResponse.status, 201);

  const transactionId = transactionResponse.body.data.id;

  const updateResponse = await request(app)
    .patch(
      `/api/accounts/${accountId}/transactions/${transactionId}`
    )
    .send({ description: "Modified deposit" });

  const deleteResponse = await request(app)
    .delete(
      `/api/accounts/${accountId}/transactions/${transactionId}`
    );

  assert.equal(updateResponse.status, 404);
  assert.equal(deleteResponse.status, 404);

  const historyResponse = await request(app)
    .get(`/api/accounts/${accountId}/transactions`);

  assert.equal(historyResponse.status, 200);
  assert.equal(
    historyResponse.body.data.transactions[0].description,
    "Initial deposit"
  );
});


test("GET account rejects an invalid UUID format", async () => {
  const response = await request(app)
    .get("/api/accounts/not-a-valid-uuid");

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});



test("Transaction history returns latest-first results with pagination metadata", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Pagination Sorting Test" });

  assert.equal(accountResponse.status, 201);

  const accountId = accountResponse.body.data.id;

  const firstTransaction = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send({
      type: "credit",
      amount: "100.00",
      referenceId: `PAGINATION-FIRST-${crypto.randomUUID()}`,
      description: "First transaction",
    });

  const secondTransaction = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send({
      type: "credit",
      amount: "50.00",
      referenceId: `PAGINATION-SECOND-${crypto.randomUUID()}`,
      description: "Second transaction",
    });

  assert.equal(firstTransaction.status, 201);
  assert.equal(secondTransaction.status, 201);

  const response = await request(app)
    .get(`/api/accounts/${accountId}/transactions?page=1&limit=1`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.transactions.length, 1);
  assert.equal(
    response.body.data.transactions[0].id,
    secondTransaction.body.data.id
  );

  assert.deepEqual(response.body.data.pagination, {
    page: 1,
    limit: 1,
    totalRecords: 2,
    totalPages: 2,
  });
});



test("POST transaction rejects a description longer than 255 characters", async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Description Length Test" });

  assert.equal(accountResponse.status, 201);

  const accountId = accountResponse.body.data.id;

  const response = await request(app)
    .post(`/api/accounts/${accountId}/transactions`)
    .send({
      type: "credit",
      amount: "10.00",
      referenceId: `LONG-DESCRIPTION-${crypto.randomUUID()}`,
      description: "A".repeat(256),
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});



test("POST transfer rejects a nonexistent destination without changing source balance", async () => {
  const sourceResponse = await request(app)
    .post("/api/accounts")
    .send({ name: "Transfer Rollback Source" });

  assert.equal(sourceResponse.status, 201);

  const sourceAccountId = sourceResponse.body.data.id;

  const creditResponse = await request(app)
    .post(`/api/accounts/${sourceAccountId}/transactions`)
    .send({
      type: "credit",
      amount: "100.00",
      referenceId: `ROLLBACK-FUND-${crypto.randomUUID()}`,
    });

  assert.equal(creditResponse.status, 201);

  const response = await request(app)
    .post("/api/transfers")
    .send({
      sourceAccountId,
      destinationAccountId: crypto.randomUUID(),
      amount: "30.00",
      referenceId: `ROLLBACK-TRANSFER-${crypto.randomUUID()}`,
    });

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(
    response.body.error.code,
    "DESTINATION_ACCOUNT_NOT_FOUND"
  );

  const sourceAfter = await request(app)
    .get(`/api/accounts/${sourceAccountId}`);

  assert.equal(sourceAfter.status, 200);
  assert.equal(sourceAfter.body.data.balance, "100.00");
});
