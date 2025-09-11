## NextPass

A modern, full‑stack event management platform for creating events, registering participants, issuing QR‑coded passes, live check‑ins, and exporting attendance.

- Live demo: [NextPass on Vercel](https://next-pass-omega.vercel.app/)
- Stack: Next.js App Router, React 19, Tailwind CSS, Firebase Admin (Firestore), Nodemailer, QRCode, ExcelJS, Framer Motion

---

### Table of Contents
- Overview
- Features
- Architecture
- Data Model
- Project Structure
- Local Development
- Environment Variables
- Deployment (Vercel)
- API Reference
- Frontend Workflows
- Email and Calendar Invites
- Attendance Export
- Security and Operational Notes
- Troubleshooting
- Scripts
- License

---

## Overview
NextPass streamlines event operations end‑to‑end:
- Organisers create and manage events, update details, notify attendees, and export attendance.
- Participants discover available events, register in a smooth flow, and get a QR‑coded pass plus an ICS calendar invite via email.
- On the event day, organisers perform live check‑ins by scanning QR codes, and can download a formatted Excel attendance report.

The application is deployed and accessible here: [NextPass on Vercel](https://next-pass-omega.vercel.app/).


## Features
- Landing experience: Animated hero, feature highlights, and simple nav to Explore, Organise, and My Passes.
- Explore events:
  - Lists events that are still accepting registrations and are upcoming.
  - One‑click register flow.
- Organise events:
  - Create events with name, date, registration deadline, and remarks.
  - Update events; all participants receive an email notification with updated details and ICS file.
  - View participants of an event.
  - Live check‑in endpoint to mark attendance.
  - Export attendance as a polished Excel report with branding and event metadata.
- Register participation:
  - Registers a participant and prevents duplicate email registrations per event.
  - Generates and stores a base64 QR image unique to the participant.
  - Sends a HTML email with inline QR code and attaches an ICS invite.
  - Stores the user’s registration history under a `users` document.
- My Passes:
  - Shows the authenticated user’s registrations.
  - Lets the user open any pass and view/download their QR code.
  - Fetches event details on demand to display the correct QR for that user.
- Beautiful UI & motion: Tailwind CSS 4 and Framer Motion across pages and modals.


## Architecture
- Framework: Next.js App Router.
- Frontend: Client components for interactive UI ("use client" where hooks/state are used). Main tabbed shell in `src/app/page.js` switches between `home`, `explore`, `organise`, and `mypass` views.
- Backend: Server code centralised in `src/app/backend.js`, exposing pure functions used by the API routes.
- API layer: Route handlers in `src/app/api/*/route.js` proxy HTTP to the backend functions. Responses are JSON (except the attendance export which streams a file).
- Persistence: Google Firestore via Firebase Admin SDK, initialised in `src/lib/firebase.js` using a Base64‑encoded service account.
- Email: SMTP via Nodemailer configured in `src/lib/mailer.js`.
- Calendar invites: ICS generation in `src/lib/calendar.js`.
- Utilities: QR code generation, Excel export, and date conversions handled on the server.

Key backend responsibilities in `src/app/backend.js`:
- `createEvent`, `updateEvent`, `getEventDetails`, `getEventsByOrganiser`, `getAvailableEvents`
- `registerParticipant` (QR generation, ICS creation, email send, and user registration history write)
- `getParticipants`, `markAttendance`, `exportAttendance`, `getRegistrationsByUser`


## Data Model
- Collection: `events/{eventId}`
  - `organiserEmail: string`
  - `eventName: string`
  - `eventDate: Timestamp|Date|ISO string`
  - `eventEndDate: Timestamp|Date|ISO string (optional)`
  - `regDeadline: Timestamp|Date|ISO string`
  - `remarks: string`
  - `participants: Array<{ id: string, name: string, email: string, regId: string, qrCodeUrl: string, attendance: boolean, checkInTime: Date|Timestamp|null }>`
  - `createdAt: serverTimestamp`
  - `updatedAt: serverTimestamp`

- Collection: `users/{email}`
  - `email: string`
  - `name: string`
  - `registrations: Array<{ eventId: string, eventName: string, regDate: Timestamp, remarks: string, eventDate: Timestamp|Date|ISO string }>`

Note: The code handles both Firestore `Timestamp` and plain JS `Date`/ISO strings to be robust across environments.


## Project Structure
```text
nextpass/
  API_DOCUMENTATION.md
  next.config.mjs
  package.json
  src/
    app/
      api/
        checkIn/route.js              // POST: markAttendance
        createEvent/route.js          // POST: createEvent
        exportAttendance/route.js     // POST: exportAttendance (xlsx stream)
        getAvailableEvents/route.js   // GET: list future events open for reg
        getEventDetails/route.js      // POST: fetch event + participants
        getEventsByOrganiser/route.js // POST: organiser’s events
        getParticipants/route.js      // (if added) fetch participants
        getUserRegistrations/route.js // POST: user’s registrations
        registerParticipant/route.js  // POST: register + email + ICS + QR
        updateEvent/route.js          // POST: update event + notify
      backend.js                      // server functions (Firestore, mail, QR, ICS, Excel)
      page.js                         // main client entry, tabbed shell
      frontend.jsx                    // legacy/aux UI (scanner, utilities, etc.)
      layout.js                       // Next.js layout
    components/
      Landing.jsx                     // Landing + NavBar + Hero + Features + Footer
      ExploreEvents.jsx               // Explore list and registration UI
      OrganiseEvents.jsx              // Organiser dashboard: create/update/view/export
      MyPasses.jsx                    // User registrations + pass modal with QR
      Logo.jsx                        // Clickable brand mark
    lib/
      firebase.js                     // Firebase Admin initialisation
      mailer.js                       // Nodemailer SMTP transport + sendMail
      calendar.js                     // ICS generation
```


## Local Development
1. Install Node.js 18+ (Next.js 15 requires modern Node; Vercel uses 18+ by default).
2. Install dependencies:
```bash
cd nextpass
npm install
```
3. Create `.env.local` in `nextpass/` and set environment variables (see next section).
4. Start the dev server:
```bash
npm run dev
```
5. Open the app at `http://localhost:3000`.


## Environment Variables
Set these in `.env.local` (for local) and in the Vercel project (for production):

- Firebase Admin (Firestore)
  - `FIREBASE_SERVICE_ACCOUNT_BASE64` — Base64‑encoded JSON service account

- SMTP (Nodemailer)
  - `SMTP_HOST`
  - `SMTP_PORT` (e.g., 587 or 465)
  - `SMTP_SECURE` ("true" for 465, otherwise "false")
  - `SMTP_USER`
  - `SMTP_PASS`

### How to create FIREBASE_SERVICE_ACCOUNT_BASE64
1. In Firebase Console, create a service account key (JSON) for your project.
2. Base64‑encode the file. Examples:

- PowerShell (Windows):
```powershell
$bytes = [System.IO.File]::ReadAllBytes("./service-account.json");
[System.Convert]::ToBase64String($bytes) | Set-Content -NoNewline -Path ./.base64
```
Copy the contents of `./.base64` into `FIREBASE_SERVICE_ACCOUNT_BASE64`.

- macOS/Linux:
```bash
base64 -w 0 service-account.json > .base64
```

The app decodes this at runtime in `src/lib/firebase.js`:
```javascript
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8'));
```
If this variable is missing, the server will throw an explicit error.


## Deployment (Vercel)
1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the project into Vercel.
3. Set the environment variables listed above in Vercel Project Settings.
4. Build & deploy.

The application is live at: [NextPass on Vercel](https://next-pass-omega.vercel.app/).


## API Reference
All endpoints are implemented as Next.js App Router handlers and call server functions from `src/app/backend.js`.

- `POST /api/createEvent`
  - Body: `{ organiserEmail, eventData: { eventName, eventDate, regDeadline, remarks } }`
  - Response: `{ success: true, eventId }`

- `POST /api/updateEvent`
  - Body: `{ eventId, updatedFields }` where `updatedFields` ⊆ { `eventName`, `eventDate`, `regDeadline`, `remarks` }
  - Side effect: Sends update emails with ICS to all participants.
  - Response: `{ success: true }`

- `GET /api/getAvailableEvents`
  - Returns events whose `regDeadline` and `eventDate` are both in the future.
  - Response: `{ success: true, events: Array }`

- `POST /api/getEventsByOrganiser`
  - Body: `{ organiserEmail }`
  - Response: `{ success: true, events: Array }`

- `POST /api/getEventDetails`
  - Body: `{ eventId }`
  - Response: `{ success: true, event }` (includes `participants` array)

- `POST /api/registerParticipant`
  - Body: `{ eventId, participantData: { name, email } }`
  - Creates participant, generates QR (base64), updates `users/{email}.registrations`, sends email with inline QR and ICS.
  - Response: `{ success: true, participant }`

- `POST /api/getUserRegistrations`
  - Body: `{ userEmail }`
  - Response: `{ success: true, registrations }`

- `POST /api/checkIn`
  - Body: `{ eventId, participantId }`
  - Marks attendance and sets `checkInTime`.
  - Response: `{ success, message, participant? }`

- `POST /api/exportAttendance`
  - Body: `{ eventId }`
  - Returns: XLSX file stream with branding and event metadata.


## Frontend Workflows
The app uses a simple tabbed shell in `src/app/page.js` that toggles views based on a local `tab` state.

- `home` → `Landing` (`src/components/Landing.jsx`)
  - NavBar buttons map to `explore`, `organise`, `mypass`.
  - CTA buttons jump to `explore` or `organise`.

- `explore` → `ExploreEvents` (`src/components/ExploreEvents.jsx`)
  - Loads available events via `GET /api/getAvailableEvents`.
  - Registration posts to `POST /api/registerParticipant`.

- `organise` → `OrganiseEvents` (`src/components/OrganiseEvents.jsx`)
  - Creates events via `POST /api/createEvent`.
  - Fetches organiser’s events via `POST /api/getEventsByOrganiser`.
  - Updates events via `POST /api/updateEvent` (triggers email notifications).
  - Views participant lists via backend fetch (`getParticipants`) or API (if wired).
  - Marks attendance by calling `POST /api/checkIn` with `eventId` + scanned `participantId`.
  - Exports attendance via `POST /api/exportAttendance` which downloads an Excel file.

- `mypass` → `MyPasses` (`src/components/MyPasses.jsx`)
  - Loads registrations via `POST /api/getUserRegistrations`.
  - Opens a modal that fetches event details via `POST /api/getEventDetails` and displays the current user’s QR code.
  - Download button saves the QR image locally.

Client components that use hooks include a "use client" directive at the top to ensure rendering on the client side.


## Email and Calendar Invites
- Registration emails are sent via `sendMail` in `src/lib/mailer.js`.
- The QR code image is generated server‑side and embedded inline (content ID `qrcode@event`).
- An ICS file is attached using `generateICS` in `src/lib/calendar.js`, allowing one‑click add to Google/Outlook calendars.
- Update emails (on `updateEvent`) include the new details and an ICS file.


## Attendance Export
- `exportAttendance` builds an Excel workbook using ExcelJS.
- The workbook includes branding, event metadata, header styling, and a row for each participant with their attendance state and check‑in time.


## Security and Operational Notes
- Secrets are read only from environment variables. Do not commit service account JSON files.
- Firebase Admin initialises once (singleton) and throws a clear error if `FIREBASE_SERVICE_ACCOUNT_BASE64` is missing.
- Email transport is created from SMTP env vars; failures are logged and bubbled as meaningful errors.
- Duplicate registrations by email are prevented per event.
- When updating events, only allowed fields are accepted; other keys are ignored.


## Troubleshooting
- "Firebase Admin Initialization Error" or missing service account
  - Ensure `FIREBASE_SERVICE_ACCOUNT_BASE64` is set and correctly Base64‑encoded.
- SMTP errors (e.g., `ECONNREFUSED`, auth errors)
  - Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`.
- Nothing renders after clicking “My Passes”
  - Ensure client components using hooks include "use client" (already added to `Landing.jsx` and `MyPasses.jsx`).
- Dates appear invalid or not formatted
  - The code attempts to support both `Timestamp` and JS dates; ensure your stored values are valid.


## Scripts
In `nextpass/package.json`:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  }
}
```

- `npm run dev` — Start local dev server with Turbopack.
- `npm run build` — Production build.
- `npm start` — Start production server.
- `npm run lint` — Run ESLint.


## License
This project is provided as‑is for educational and demonstrative purposes.


---

References:
- Deployed application: [NextPass on Vercel](https://next-pass-omega.vercel.app/)


