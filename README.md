# HelpDesk Mini Ticketing System

This is a full-stack MERN application for a mini helpdesk system.

## Architecture Note

The application follows a standard client-server architecture.

- **Backend**: A stateless RESTful API built with Node.js and Express. User authentication is managed via JSON Web Tokens (JWT). Mongoose is used for interacting with the MongoDB database.
- **Frontend**: Frontend is built with React and Vite. It communicates with the backend via API calls and manages its state using Zustand. All protected pages are guarded by an authentication check.
- **Database & Caching**: MongoDB serves as the primary persistent data store. Redis is used as a high-performance in-memory store for caching and features like rate limiting and idempotency, significantly reducing the load on the primary database.

---

## API Summary

| Method  | Endpoint                    | Description                               | Protected |
| :------ | :-------------------------- | :---------------------------------------- | :-------- |
| `POST`  | `/api/auth/register`        | Register a new user.                      | No        |
| `POST`  | `/api/auth/login`           | Log in a user and receive a JWT.          | No        |
| `GET`   | `/api/users/me`             | Get the current logged-in user's profile. | Yes       |
| `POST`  | `/api/tickets`              | Create a new ticket.                      | Yes       |
| `GET`   | `/api/tickets`              | Get a list of tickets (role-based).       | Yes       |
| `GET`   | `/api/tickets/:id`          | Get a single ticket by its ID.            | Yes       |
| `PATCH` | `/api/tickets/:id`          | Update a ticket (agents/admins only).     | Yes       |
| `POST`  | `/api/tickets/:id/comments` | Add a comment to a ticket.                | Yes       |

---

## Robustness Features

### Pagination

The `GET /api/tickets` endpoint supports `limit` and `offset` query parameters for pagination.

- `?limit=10&offset=0`: Returns the first 10 tickets.
- The response includes `{ "items": [...], "next_offset": 10 }`. A `next_offset` of `null` indicates the last page.

### Idempotency

All `POST` requests support the `Idempotency-Key` header to prevent accidental duplicate resource creation. Send a unique UUID in this header. Sending the same request with the same key will return the original cached response.

### Rate Limiting

The API enforces a rate limit of **60 requests per minute per user** on all protected endpoints. Exceeding this limit will result in a `429 Too Many Requests` error.

---

## Test User Credentials

You can use the registration endpoint (`POST /api/auth/register`) to create your own users. Here are some examples:

- **Standard User**:
  - **Email**: `test@example.com`
  - **Password**: `password123`
- **Agent User** (create via registration by including `"role": "agent"` in the body):
  - **Email**: `agent@example.com`
  - **Password**: `agentPassword123`

---
