# API documentation

Base URL: `http://localhost:5000/api`. All bodies are JSON. Private endpoints need the header `Authorization: Bearer <token>` (the token comes from `POST /api/login`).

Errors always look like this (the `errors` array only appears for validation problems):

```json
{ "success": false, "message": "Validation error", "errors": ["\"email\" must be a valid email"] }
```

| Status | Meaning |
| --- | --- |
| 400 | Validation error or invalid id |
| 401 | Missing, invalid, expired or logged-out token. Also wrong login |
| 403 | Authenticated but not an admin |
| 404 | Lead or route not found |
| 429 | Rate limit reached |
| 500 | Server error (details are only in the server log) |

## Public

### POST /api/leads
Creates a lead (website form). The status is always `New`.

| Field | Rules |
| --- | --- |
| `name` | required, 2 to 100 characters |
| `email` | required, valid email |
| `phone` | required, 7 to 20 characters: digits, spaces, `+ - ( )` |
| `company` | optional |
| `service` | required: `Web Development`, `Mobile App`, `E-Commerce`, `UI/UX Design`, `Digital Marketing`, `Other` |
| `budget` | optional: `Less than 10,000`, `10,000 - 25,000`, `25,000 - 50,000`, `50,000+`, `Not Sure` (an en dash is accepted too) |
| `message` | required, up to 2000 characters |

Request
```json
{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "phone": "01000000000",
  "company": "ABC Company",
  "service": "Web Development",
  "budget": "10,000 - 25,000",
  "message": "I need a company website."
}
```
Response `201`
```json
{ "success": true, "message": "Your request has been submitted successfully. Our team will contact you soon.", "lead": { "id": "66f0..." } }
```

### POST /api/login
Request `{ "email": "admin@example.com", "password": "your-admin-password" }` (use the values configured in `backend/.env`)

Response `200`
```json
{ "success": true, "message": "Login successful", "token": "<jwt>", "user": { "name": "MTEC Admin", "email": "admin@example.com", "role": "admin", "id": "..." } }
```
Wrong email or password returns `401 { "message": "Invalid email or password" }` (same message for both).

## Private (admin only)

### POST /api/logout
Invalidates the token that sent the request. Response `200 { "success": true, "message": "Logged out successfully" }`. The same token returns `401` afterwards.

### GET /api/me
Returns the logged-in admin. Used by the dashboard to restore a session.

### GET /api/leads
Query parameters (all optional):

| Param | Values |
| --- | --- |
| `search` | matches name, email, phone or company |
| `status` | `All`, `New`, `Contacted`, `Interested`, `In Progress`, `Won`, `Lost` |
| `sort` | `newest` (default), `oldest`, `name`, `status`, `service` |
| `page`, `limit` | defaults `1` and `10` (max 100) |

Response `200`
```json
{
  "success": true,
  "results": 10,
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 },
  "leads": [ { "id": "...", "name": "...", "status": "New", "created_at": "...", "updated_at": "..." } ]
}
```

### GET /api/leads/export
Same filters as above. Returns `leads.csv` (up to 10,000 rows).

### GET /api/leads/:id
Response `200 { "success": true, "lead": { ... } }`. Unknown id: `404`.

### PUT /api/leads/:id
Send any of: `name`, `phone`, `company`, `service`, `budget`, `message`, `status`, `notes`, `followUpDate` (ISO date or `null`). At least one field is required. Email cannot be changed.

```json
{ "status": "Contacted", "notes": "Called on Sunday" }
```
Response `200 { "success": true, "message": "Lead updated successfully", "lead": { ... } }`

### DELETE /api/leads/:id
Response `200 { "success": true, "message": "Lead deleted successfully" }`

### GET /api/dashboard/stats
```json
{
  "success": true,
  "stats": {
    "total": 10, "new": 2, "contacted": 2, "interested": 1, "inProgress": 2, "won": 2, "lost": 1,
    "followUpsDue": 1,
    "byStatus": { "New": 2, "Contacted": 2, "Interested": 1, "In Progress": 2, "Won": 2, "Lost": 1 },
    "byService": [ { "service": "Web Development", "count": 3 } ],
    "byMonth": [ { "month": "2026-05", "count": 0 } ]
  }
}
```
`byMonth` covers the last 6 months. `followUpsDue` counts open leads whose follow-up date is today or earlier.
