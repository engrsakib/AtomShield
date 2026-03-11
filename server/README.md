# AtomShield — Server

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-6.x-CC0000?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Zod](https://img.shields.io/badge/Validation-Zod-000000)](https://github.com/colinhacks/zod)
[![Rate Limit](https://img.shields.io/badge/Rate--Limit-express--rate--limit-blue)](https://www.npmjs.com/package/express-rate-limit)
[![dotenv](https://img.shields.io/badge/dotenv-env-4A4A4A?logo=dotenv&logoColor=white)](https://github.com/motdotla/dotenv)
[![JWT](https://img.shields.io/badge/Auth-JWT-FF7A00)](https://jwt.io/)
[![Bcrypt](https://img.shields.io/badge/Security-Bcrypt-6D3F1A)](https://github.com/kelektiv/node.bcrypt.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

AtomShield is an enterprise-grade backend implementing hierarchical Role-Based Access Control (RBAC), strict Grant Ceiling validation, audit logging, rate limiting, and transactional integrity — built with Node.js, TypeScript, and MongoDB.

---

Table of Contents
- Overview
- Why AtomShield?
- Key Features
- Architecture & Design
- Getting Started
  - Prerequisites
  - Clone & Install
  - Environment Variables
  - Run Locally
- API Reference (Selected Endpoints)
- Core Concepts
  - Grant Ceiling
  - Atomic Transactions
  - Audit Logging
  - Rate Limiting & OTP Throttling
- Project Structure
- Testing & CI (includes sample performance / test data)
- Deployment & Production Notes
- Security Best Practices
- Contributing
- Maintainers & Acknowledgements
- License

---

## Overview
AtomShield provides a secure, auditable, and transaction-safe backend for applications that require fine-grained permission management. It prevents privilege escalation via grant ceilings, keeps a full audit trail of permission changes, and uses MongoDB multi-document transactions to keep updates consistent.

---

## Why AtomShield?
- Prevents intentional or accidental privilege escalation through strict grant rules.
- Ensures operations affecting multiple collections are atomic.
- Records every permission change for compliance and incident investigations.
- Offers specialized rate-limiting for sensitive flows (OTP) to reduce abuse and cost.
- Modular architecture makes it easy to extend for enterprise requirements.

---

## Key Features
- Hierarchical permission model with Grant Ceiling enforcement.
- Auto-provisioning of default permissions on registration or role changes.
- Multi-document MongoDB transactions for atomic operations.
- Global and route-scoped rate limiting, including dedicated OTP throttling.
- Audit logs capturing actor, target, deltas, reason, and timestamps.
- Soft-delete and recovery flows for user accounts.
- TypeScript-first codebase with Zod validation for secure inputs.

---

## Architecture & Design
Design principles:
- Separation of concerns: controllers (HTTP handling), services (business logic), models (persistence), middlewares (auth, rate-limiting).
- Least privilege by default: default permission set on new accounts is minimized.
- Audit-first: every permission change produces an audit record.
- Transactional safety for multi-collection updates.

High-level diagram:
```
[Client] <-HTTPS-> [Express API] -> [Services (Grant checks, Transactions)]
                                  -> [MongoDB (Users, Permissions, AuditLogs)]
                                  -> [RateLimiter / OTP Service / Email]
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- MongoDB (local or Atlas)
- (Optional) Docker & Docker Compose for containerized local testing

### Clone & Install
```bash
git clone https://github.com/engrsakib/AtomShield.git
cd AtomShield/server
npm install
# or
yarn
```

### Environment Variables
Create `server/.env` with values appropriate to your environment:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/atomshield
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# OTP rate limiting
OTP_RATE_LIMIT_WINDOW_MS=60000
OTP_RATE_LIMIT_MAX=3

# Email / SMS
EMAIL_HOST=smtp.example.com
EMAIL_USER=you@example.com
EMAIL_PASS=supersecure
```

### Run Locally
```bash
npm run dev
# or
yarn dev
```
Default server address: http://localhost:5000

---

## API Reference (Selected Endpoints)

Below are essential endpoints with example payloads.

1. Register a user/admin
- POST /api/v1/admin/create
- Body:
```json
{
  "email": "alice@example.com",
  "password": "StrongP@ssw0rd",
  "role": "tester"
}
```

2. Update user and roles (transactional)
- PATCH /api/v1/admin/update/:id
- Body (example):
```json
{
  "profile": { "name": "Alice Sharma" },
  "permissions": ["tickets.read", "tickets.comment"]
}
```

3. Send OTP (rate limited)
- POST /api/v1/otp/send-otp
- Body:
```json
{ "phone": "+8801XXXXXXXXX", "purpose": "login" }
```

4. Get user permissions and audit logs
- GET /api/v1/permissions/:userId

cURL example — create user:
```bash
curl -X POST http://localhost:5000/api/v1/admin/create \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"StrongP@ssw0rd","role":"tester"}'
```

---

## Core Concepts

### Grant Ceiling
Grant Ceiling ensures that a user (the actor) cannot grant any permission that they themselves do not possess. This enforces a strict delegation policy and prevents privilege escalation.

Illustrative code:
```ts
const invalidKeys = requestedPermissions.filter(k => !actorPermissions.includes(k));
if (invalidKeys.length > 0) {
  throw new ApiError(403, "You cannot grant permissions you don't possess.");
}
```

Behavior:
- On creation/role-change, requested permissions are compared against the actor.
- If invalid keys exist, the request is rejected with HTTP 403.

### Atomic Transactions
Important multi-collection updates (e.g., updating a user and writing an audit entry) are executed inside a MongoDB transaction:

```ts
const session = await mongoose.startSession();
try {
  session.startTransaction();
  await User.updateOne({ _id }, update, { session });
  await AuditLog.create([logEntry], { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

Note: Transactions require a MongoDB replica set — ensure your environment is configured accordingly (Atlas or local replica set).

### Audit Logging
Each permission or role change results in a structured audit document:
- actorId
- targetId
- action (grant/revoke/update)
- delta: { added: [], removed: [] }
- reason (optional)
- timestamp

Example AuditLog document:
```json
{
  "actorId": "603f1f7b2a4f4b3f9c9e1a2b",
  "targetId": "603f1f7b2a4f4b3f9c9e1a2c",
  "action": "grant",
  "delta": { "added": ["tickets.manage"], "removed": [] },
  "reason": "Assigning ticket admin for sprint",
  "createdAt": "2026-03-11T10:12:34.000Z"
}
```

### Rate Limiting & OTP Throttling
- Global rate limiter (e.g., 100 req / 15 min) via `express-rate-limit`.
- OTP endpoint-specific limiter (e.g., 3 req / 1 min) to protect SMS gateway usage.
- Rate limit configuration supports IP + user keying and custom handlers for logging/block messages.

---

## Project Structure
Recommended layout:

```
server/
├─ src/
│  ├─ controllers/
│  ├─ services/
│  ├─ models/
│  ├─ middlewares/
│  ├─ utils/
│  ├─ config/
│  └─ index.ts
├─ tests/
├─ package.json
├─ tsconfig.json
└─ .env.example
```

- controllers: HTTP layer and request validation
- services: core business logic (grant ceiling, transactions, audit)
- models: Mongoose schemas (User, Permission, AuditLog, OTP)
- middlewares: auth, error handler, rate limiting
- utils: helpers, ApiError types, logger

---

## Testing & CI

This section includes:
- Unit & integration test guidance
- Example test data (seed / performance)
- CI hints

### Local tests
- Use mongodb-memory-server for fast, isolated tests or run a test Mongo container.
- Run:
```bash
npm run test
```

### Example test (integration) flow
1. Start test DB (in-memory or container)
2. Create actor user with limited permissions
3. Attempt to grant higher permission -> expect 403
4. Create admin user with required permissions -> grant succeeds
5. Verify AuditLog entries and transactional behavior

### Seed & Sample Test Data
Use these sample JSON files to seed a dev DB quickly.

1) seed/users.json
```json
[
  {
    "email": "superadmin@example.com",
    "password": "SuperAdminP@ss1",
    "role": "superadmin",
    "permissions": ["users.*", "permissions.*", "audit.*"]
  },
  {
    "email": "alice@example.com",
    "password": "AliceP@ss1",
    "role": "tester",
    "permissions": ["tickets.read", "tickets.create"]
  },
  {
    "email": "bob@example.com",
    "password": "BobP@ss1",
    "role": "developer",
    "permissions": ["tickets.read", "tickets.comment", "tickets.update"]
  }
]
```

2) sample API test: grant failure (actor lacks permission)
```bash
# Bob (developer) tries to grant tickets.manage to Alice — should fail
curl -X PATCH http://localhost:5000/api/v1/admin/update/<<ALICE_ID>> \
  -H "Authorization: Bearer <<BOB_TOKEN>>" \
  -H "Content-Type: application/json" \
  -d '{"permissions": ["tickets.manage"]}'
# Expected: HTTP 403 with message "You cannot grant permissions you don't possess."
```

3) audit log expected entry on successful grant:
```json
{
  "actorId": "ID_OF_SUPERADMIN",
  "targetId": "ID_OF_ALICE",
  "action": "grant",
  "delta": { "added": ["tickets.manage"], "removed": [] },
  "reason": "Promotion to ticket admin",
  "createdAt": "2026-03-11T11:00:00.000Z"
}
```

### Performance / Load Test (basic)
You can use a small Node script or `ab` (ApacheBench) to approximate load. Example with `artillery` is recommended for richer scenario.

Minimal artillery `perf.yml`:
```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - post:
          url: "/api/v1/otp/send-otp"
          json:
            phone: "+8801XXXXXXXXX"
            purpose: "login"
```

Run:
```bash
npx artillery run perf.yml
```

Expected quick metrics (example from a small run):
- Requests: 600
- RPS (avg): 10
- Latency p50: 120ms
- Latency p95: 320ms
- Errors: 0 (assuming service and DB healthy)

(These numbers are illustrative; run in your environment for real numbers.)

### CI (GitHub Actions) hint
Create `.github/workflows/ci.yml` to run tests on push/PR. Include a mongo service container for integration tests.

---

## Deployment & Production Notes
- Use a process manager (PM2) or container orchestrator (Kubernetes).
- Run behind a TLS reverse proxy (NGINX / Cloud LB).
- Use MongoDB Atlas or self-managed replica set (transactions require replica set).
- Use centralized logging and monitoring (ELK or Grafana + Prometheus).
- Configure autoscaling and health checks for API instances.
- Use secrets manager for environment variables (AWS Secrets Manager, HashiCorp Vault).

---

## Security Best Practices
- Short-lived JWTs with refresh tokens; secure storage of refresh tokens.
- Enforce strong password policies and bcrypt salted hashing.
- Validate all inputs via Zod schemas and reject unexpected payloads.
- Limit sensitive endpoints via rate-limiting and IP/role checks.
- Log and alert on suspicious activity (multiple failed OTPs, repeated 403s).
- Regularly audit and rotate API keys and secrets.

---

## Contributing
1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Add tests and documentation
4. Open a pull request with a clear description and tests

Please follow existing TypeScript linting rules and include unit tests for any security-critical code (e.g., grant ceiling and transaction logic).

---

## Maintainers & Acknowledgements
- Lead Developer: Md. Nazmus Sakib (@engrsakib)  

Thanks to the open-source projects used:
Express, Mongoose, Zod, express-rate-limit, bcrypt, jsonwebtoken.

---

## License
This project is licensed under the MIT License — see the LICENSE file in the repository root.

---
What I included:
- Full README (above)
- Seed data and performance test example
- CI and env examples below
If you want, I can commit these helper files into the repository (`server/.env.example`, `server/seed/users.json`, `.github/workflows/ci.yml`, `perf.yml`) — tell me to proceed and provide commit message. 