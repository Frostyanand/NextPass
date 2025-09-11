## NextPass API Documentation

This document details all available API endpoints for the NextPass backend, including methods, paths, payloads, responses, status codes, and notes. The backend is built using Next.js App Router with API routes under `/api/*` and Firestore for persistence.

Base URL examples:
- Local development: `http://localhost:3000`
- Production: `

All endpoints return JSON unless otherwise specified.

---

### Data Models

- **Event**:
  - `id` (string): Event ID (UUID)
  - `organiserEmail` (string)
  - `eventName` (string)
  - `eventDate` (Date): In responses, serialized to ISO 8601 by Next.js. In requests, send ISO 8601
  - `regDeadline` (Date): Send ISO 8601 in requests
  - `remarks` (string)
  - `createdAt` (Timestamp)
  - `updatedAt` (Timestamp)
  - `participants` (Participant[]): Only included by some endpoints

- **Participant**:
  - `id` (string): UUID
  - `name` (string)
  - `email` (string)
  - `regId` (string): Same as `id`
  - `qrCodeUrl` (string): Base64 data URL PNG
  - `attendance` (boolean)
  - `checkInTime` (Date | null)

- **User Registration Record** (stored in `users/{email}.registrations[]`):
  - `eventId` (string)
  - `eventName` (string)
  - `regDate` (Timestamp)
  - `remarks` (string)
  - `eventDate` (Timestamp | Date)

Date handling:
- Send dates as ISO 8601 strings (e.g. `2025-12-31T18:30:00.000Z`).
- Responses will contain ISO strings when serialized by Next.js.

---

## Endpoints

### 1) Create Event
- **Method**: POST
- **Path**: `/api/createEvent`
- **Body (JSON)**:
```json
{
  "organiserEmail": "organiser@example.com",
  "eventData": {
    "eventName": "Tech Meetup",
    "eventDate": "2025-12-31T18:30:00.000Z",
    "regDeadline": "2025-12-30T18:30:00.000Z",
    "remarks": "Welcome!"
  }
}
```
- **Success Response**: 200
```json
{
  "success": true,
  "eventId": { "eventId": "<uuid>", "path": "events/<uuid>" }
}
```
  - Note: The `eventId` field in response contains an object with `eventId` and `path` as implemented by `createEvent`.
- **Error Responses**:
  - 400: `{ "error": "Missing fields" }`
  - 500: `{ "error": "<message>" }`

Notes:
- Creates a Firestore document in `events/{eventId}`.
- Initializes an empty `participants` array.

---

### 2) Get Events By Organiser
- **Method**: POST
- **Path**: `/api/getEventsByOrganiser`
- **Body (JSON)**:
```json
{ "organiserEmail": "organiser@example.com" }
```
- **Success Response**: 200
```json
{
  "success": true,
  "events": [
    {
      "id": "<eventId>",
      "organiserEmail": "organiser@example.com",
      "eventName": "Tech Meetup",
      "eventDate": "2025-12-31T18:30:00.000Z",
      "regDeadline": "2025-12-30T18:30:00.000Z",
      "remarks": "Welcome!",
      "createdAt": "<timestamp>",
      "updatedAt": "<timestamp>"
    }
  ]
}
```
- **Error Responses**:
  - 400: `{ "error": "Missing organiserEmail" }`
  - 500: `{ "error": "<message>" }`

Notes:
- Excludes the `participants` array from each event in the response.

---

### 3) Get Event Details
- **Method**: POST
- **Path**: `/api/getEventDetails`
- **Body (JSON)**:
```json
{ "eventId": "<eventId>" }
```
- **Success Response**: 200
```json
{
  "success": true,
  "event": {
    "id": "<eventId>",
    "organiserEmail": "organiser@example.com",
    "eventName": "Tech Meetup",
    "eventDate": "2025-12-31T18:30:00.000Z",
    "regDeadline": "2025-12-30T18:30:00.000Z",
    "remarks": "Welcome!",
    "createdAt": "<timestamp>",
    "updatedAt": "<timestamp>",
    "participants": [
      {
        "id": "<uuid>",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "regId": "<uuid>",
        "qrCodeUrl": "data:image/png;base64,...",
        "attendance": false,
        "checkInTime": null
      }
    ]
  }
}
```
- **Error Responses**:
  - 400: `{ "error": "Missing eventId" }`
  - 404: `{ "error": "Event not found" }`
  - 500: `{ "error": "<message>" }`

---

### 4) Update Event
- **Method**: POST
- **Path**: `/api/updateEvent`
- **Body (JSON)**:
```json
{
  "eventId": "<eventId>",
  "updatedFields": {
    "eventName": "New Name",
    "eventDate": "2026-01-01T10:00:00.000Z",
    "regDeadline": "2025-12-31T10:00:00.000Z",
    "remarks": "Updated info"
  }
}
```
- Allowed fields in `updatedFields`: `eventName`, `eventDate`, `regDeadline`, `remarks`.
- **Success Response**: 200
```json
{ "success": true }
```
- **Error Responses**:
  - 400: `{ "error": "Missing fields" }`
  - 500: `{ "error": "<message>" }`

Notes:
- Updates `updatedAt` automatically.
- Triggers email notifications with `.ics` attachments to all participants (if any) reflecting the latest event state.

---

### 5) Register Participant
- **Method**: POST
- **Path**: `/api/registerParticipant`
- **Body (JSON)**:
```json
{
  "eventId": "<eventId>",
  "participantData": {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```
- **Success Response**: 200
```json
{
  "success": true,
  "participant": {
    "id": "<uuid>",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "regId": "<uuid>",
    "qrCodeUrl": "data:image/png;base64,...",
    "attendance": false,
    "checkInTime": null
  }
}
```
- **Error Responses**:
  - 400: `{ "error": "eventId, name, and email are required" }`
  - 400: `{ "success": false, "error": "Registration deadline has passed" }`
  - 400: `{ "success": false, "error": "Participant with this email already registered" }`
  - 404: `{ "success": false, "error": "Event <id> not found" }`
  - 500: `{ "success": false, "error": "<message>" }`

Side effects:
- Adds the participant to `events/{eventId}.participants`.
- Creates/merges `users/{email}` and appends a record to `registrations[]`.
- Sends a registration email with QR code (inline image) and `.ics` calendar invite.

---

### 6) Get Participants (by Event)
- **Method**: GET
- **Path**: `/api/getParticipants?eventId=<eventId>`
- **Query Params**:
  - `eventId` (string) required
- **Success Response**: 200
```json
{
  "success": true,
  "participants": [
    {
      "id": "<uuid>",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "regId": "<uuid>",
      "qrCodeUrl": "data:image/png;base64,...",
      "attendance": false,
      "checkInTime": null
    }
  ]
}
```
- **Error Responses**:
  - 400: `{ "error": "eventId query parameter is required" }`
  - 404: `{ "success": false, "error": "Event <id> not found" }`
  - 500: `{ "success": false, "error": "<message>" }`

---

### 7) Check-In (Mark Attendance)
- **Method**: POST
- **Path**: `/api/checkIn`
- **Body (JSON)**:
```json
{ "eventId": "<eventId>", "participantId": "<participantId>" }
```
- **Success Response**: 200
```json
{
  "success": true,
  "message": "Check-in successful at 2025-09-11 10:00:00",
  "participant": {
    "id": "<participantId>",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "regId": "<participantId>",
    "qrCodeUrl": "data:image/png;base64,...",
    "attendance": true,
    "checkInTime": "2025-09-11T10:00:00.000Z"
  }
}
```
- **Already Checked-In Response**: 200
```json
{
  "success": false,
  "message": "Already checked in at <local time string>"
}
```
- **Error Responses**:
  - 400: `{ "error": "eventId and participantId are required" }`
  - 404: `{ "success": false, "error": "Event <id> not found" }`
  - 404: `{ "success": false, "error": "Participant not found" }`
  - 500: `{ "success": false, "error": "<message>" }`

---

### 8) Export Attendance (XLSX)
- **Method**: POST
- **Path**: `/api/exportAttendance`
- **Body (JSON)**:
```json
{ "eventId": "<eventId>" }
```
- **Success Response**: 200
  - Returns a binary XLSX with headers:
    - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    - `Content-Disposition: attachment; filename=<eventId>_attendance.xlsx`
- **Error Responses**:
  - 400: `{ "success": false, "message": "Missing eventId" }`
  - 404: `{ "success": false, "message": "Event not found" }`
  - 500: `{ "success": false, "message": "<message>" }`

Notes:
- Sheet title: `Attendance`.
- Includes header branding, event details, and a table with columns: Name, Email, ID, Attendance, Check-in Time.

---

### 9) Get Available Events (public browse)
- **Method**: GET
- **Path**: `/api/getAvailableEvents`
- **Success Response**: 200
```json
{
  "success": true,
  "events": [
    {
      "id": "<eventId>",
      "eventName": "Tech Meetup",
      "organiserEmail": "organiser@example.com",
      "eventDate": "2025-12-31T18:30:00.000Z",
      "regDeadline": "2025-12-30T18:30:00.000Z",
      "remarks": "Welcome!"
    }
  ]
}
```
- **Error Responses**:
  - 500: `{ "success": false, "error": "<message>" }`

Notes:
- Only returns events whose `regDeadline` and `eventDate` are both in the future relative to request time.

---

### 10) Get User Registrations
- **Method**: POST
- **Path**: `/api/getUserRegistrations`
- **Body (JSON)**:
```json
{ "userEmail": "jane@example.com" }
```
- **Success Response**: 200
```json
{
  "success": true,
  "registrations": [
    {
      "eventId": "<eventId>",
      "eventName": "Tech Meetup",
      "regDate": "<timestamp>",
      "remarks": "Welcome!",
      "eventDate": "2025-12-31T18:30:00.000Z"
    }
  ]
}
```
- **Error Responses**:
  - 400: `{ "error": "Missing userEmail" }`
  - 500: `{ "error": "<message>" }`

Notes:
- Returns an empty array if the user doc does not exist.

---

## Usage Examples

Replace `<BASE_URL>` with your app’s base URL.

### fetch (browser / Next.js)
```javascript
// Create Event
await fetch(`${BASE_URL}/api/createEvent`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organiserEmail: 'organiser@example.com',
    eventData: {
      eventName: 'Tech Meetup',
      eventDate: '2025-12-31T18:30:00.000Z',
      regDeadline: '2025-12-30T18:30:00.000Z',
      remarks: 'Welcome!'
    }
  })
});

// Register Participant
await fetch(`${BASE_URL}/api/registerParticipant`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventId: '<eventId>',
    participantData: { name: 'Jane Doe', email: 'jane@example.com' }
  })
});

// Get Participants
await fetch(`${BASE_URL}/api/getParticipants?eventId=<eventId>`);

// Check In
await fetch(`${BASE_URL}/api/checkIn`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventId: '<eventId>', participantId: '<participantId>' })
});

// Export Attendance (download)
const res = await fetch(`${BASE_URL}/api/exportAttendance`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventId: '<eventId>' })
});
const blob = await res.blob();
// then createObjectURL to download

// Get Available Events
await fetch(`${BASE_URL}/api/getAvailableEvents`);

// Get Events By Organiser
await fetch(`${BASE_URL}/api/getEventsByOrganiser`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ organiserEmail: 'organiser@example.com' })
});

// Get Event Details
await fetch(`${BASE_URL}/api/getEventDetails`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventId: '<eventId>' })
});

// Get User Registrations
await fetch(`${BASE_URL}/api/getUserRegistrations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userEmail: 'jane@example.com' })
});
```

### curl
```bash
# Create Event
curl -X POST "${BASE_URL}/api/createEvent" \
  -H "Content-Type: application/json" \
  -d '{
    "organiserEmail": "organiser@example.com",
    "eventData": {
      "eventName": "Tech Meetup",
      "eventDate": "2025-12-31T18:30:00.000Z",
      "regDeadline": "2025-12-30T18:30:00.000Z",
      "remarks": "Welcome!"
    }
  }'

# Register Participant
curl -X POST "${BASE_URL}/api/registerParticipant" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "<eventId>",
    "participantData": { "name": "Jane Doe", "email": "jane@example.com" }
  }'

# Get Participants
curl "${BASE_URL}/api/getParticipants?eventId=<eventId>"

# Check-In
curl -X POST "${BASE_URL}/api/checkIn" \
  -H "Content-Type: application/json" \
  -d '{ "eventId": "<eventId>", "participantId": "<participantId>" }'

# Export Attendance
echo '{"eventId": "<eventId>"}' | \
  curl -X POST "${BASE_URL}/api/exportAttendance" \
  -H "Content-Type: application/json" \
  --data-binary @- \
  -o "<eventId>_attendance.xlsx"

# Get Available Events
curl "${BASE_URL}/api/getAvailableEvents"

# Get Events By Organiser
curl -X POST "${BASE_URL}/api/getEventsByOrganiser" \
  -H "Content-Type: application/json" \
  -d '{ "organiserEmail": "organiser@example.com" }'

# Get Event Details
curl -X POST "${BASE_URL}/api/getEventDetails" \
  -H "Content-Type: application/json" \
  -d '{ "eventId": "<eventId>" }'

# Get User Registrations
curl -X POST "${BASE_URL}/api/getUserRegistrations" \
  -H "Content-Type: application/json" \
  -d '{ "userEmail": "jane@example.com" }'
```

---

## Validation and Business Rules
- `createEvent`: `organiserEmail` is required. `eventDate` and `regDeadline` should be valid dates (ISO). Both are stored as Firestore timestamps when possible.
- `updateEvent`: Only `eventName`, `eventDate`, `regDeadline`, `remarks` are updatable. Others are ignored.
- `registerParticipant`:
  - Requires `eventId`, `name`, `email`.
  - Fails if `regDeadline` has passed.
  - Ensures participant email is unique per event.
  - Sends registration email with QR code and `.ics`.
  - Adds a record in the user document under `registrations`.
- `checkIn`:
  - Idempotent: If already checked in, returns `success: false` with a message.
  - On first check-in, sets `attendance: true` and `checkInTime: now`.
- `getAvailableEvents` filters out events whose `regDeadline` or `eventDate` are past.

## Authentication
- No explicit authentication is enforced by the backend routes. The frontend should ensure only authorized organisers can manage their events.

## Content Types
- Requests with bodies must set `Content-Type: application/json`.
- File download (`/api/exportAttendance`) returns binary XLSX with appropriate headers.

## Error Handling
- Non-2xx responses include a JSON body with an `error` or `message` explaining the failure.
- Common statuses: 400 (bad request), 404 (not found), 500 (server error). 