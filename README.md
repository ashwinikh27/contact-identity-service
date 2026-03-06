# Contact Identity Service

## Overview

Contact Identity Service is a backend system that helps identify and link contact records belonging to the same customer using email addresses or phone numbers.

In many systems, a single customer may interact using different contact details. This service ensures that such records are connected and treated as a single customer identity.

When a request is received, the service:
- Searches for existing contacts with the same email or phone number
- Determines the **primary contact** (the oldest record)
- Creates **secondary contacts** when new information appears
- Returns a consolidated view of the customer's contact information

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- HTML + JavaScript (for testing UI)

---

## API Endpoint

```
POST /identify
```

---

## Request Body

```json
{
  "email": "string",
  "phoneNumber": "string"
}
```

At least **one field must be provided**.

---

## Response Format

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@fluxkart.com", "brown@fluxkart.com"],
    "phoneNumbers": ["111111", "222222"],
    "secondaryContactIds": [2, 3]
  }
}
```

---

## Example Request

```json
{
  "email": "doc@fluxkart.com",
  "phoneNumber": "111111"
}
```

---

## Example Response

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@fluxkart.com"],
    "phoneNumbers": ["111111"],
    "secondaryContactIds": []
  }
}
```

---

## Running the Project

Install dependencies:

```
npm install
```

Start the server:

```
npm run dev
```

Server runs at:

```
http://localhost:3000
```
