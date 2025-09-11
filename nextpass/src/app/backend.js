import { v4 as uuidv4 } from "uuid";
import { db, FieldValue, Timestamp } from "@/lib/firebase"; 
import { sendMail } from "@/lib/mailer";
import { generateICS } from "@/lib/calendar";
import QRCode from "qrcode";
import ExcelJS from "exceljs";

/* ---------------------------
   Utilities
   --------------------------- */
function parseDateField(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d;
}
async function generateQRCodeBase64(text) {
  try {
    return await QRCode.toDataURL(text); // returns base64 PNG
  } catch (err) {
    throw new Error("QR code generation failed: " + err.message);
  }
}
/* ---------------------------
   Event Management functions
   --------------------------- */

/**
 * createEvent
 */
export async function createEvent(organiserEmail, eventData = {}) {
  if (!organiserEmail) throw new Error("organiserEmail is required");

  const { eventName = "", eventDate = null, regDeadline = null, remarks = "" } = eventData;

  const eventId = uuidv4();
  const docRef = db.collection("events").doc(eventId);

  const payload = {
    organiserEmail,
    eventName,
    eventDate: parseDateField(eventDate),
    regDeadline: parseDateField(regDeadline),
    remarks,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    participants: []
  };

  await docRef.set(payload);
  return { eventId, path: docRef.path };
}

/**
 * getEventsByOrganiser
 */
export async function getEventsByOrganiser(organiserEmail) {
  if (!organiserEmail) throw new Error("organiserEmail is required");
  const q = db.collection("events").where("organiserEmail", "==", organiserEmail);
  const snap = await q.get();
  const events = [];
  snap.forEach(doc => {
    const data = doc.data() || {};
    const { participants, ...rest } = data;
    events.push({ id: doc.id, ...rest });
  });
  return events;
}

/**
 * getEventDetails
 */
export async function getEventDetails(eventId) {
  if (!eventId) throw new Error("eventId is required");
  const docRef = db.collection("events").doc(eventId);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error(`Event with id ${eventId} not found`);
  return { id: snap.id, ...(snap.data() || {}) };
}

/**
 * updateEvent
 */
export async function updateEvent(eventId, updatedFields = {}) {
  if (!eventId) throw new Error("eventId is required");
  if (!updatedFields || Object.keys(updatedFields).length === 0) {
    throw new Error("updatedFields must contain at least one field to change");
  }

  const ALLOWED = new Set(["eventName", "eventDate", "regDeadline", "remarks"]);
  const payload = {};

  for (const [k, v] of Object.entries(updatedFields)) {
    if (!ALLOWED.has(k)) continue;
    if (k === "eventDate" || k === "regDeadline") {
      payload[k] = parseDateField(v);
    } else {
      payload[k] = v;
    }
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("No valid updatable fields provided");
  }

  payload.updatedAt = FieldValue.serverTimestamp();

  const docRef = db.collection("events").doc(eventId);
  const snapshot = await docRef.get();
  if (!snapshot.exists) throw new Error(`Event ${eventId} not found`);

  await docRef.update(payload);

  const afterSnap = await docRef.get();
  const participants = (afterSnap.data() && afterSnap.data().participants) || [];

  try {
    const mailResult = await sendUpdateEmails(eventId, payload, participants);
    return { success: true, mailed: Boolean(mailResult), mailResult };
  } catch (err) {
    console.error("Error while sending update emails:", err);
    return { success: true, mailed: false, error: String(err) };
  }
}

/**
 * Send event update emails to all participants
 * @param {string} eventId
 * @param {object} updatedFields
 * @param {Array} participants
 */
export async function sendUpdateEmails(eventId, updatedFields, participants = []) {
  if (!participants.length) {
    return { note: "No participants to notify", eventId };
  }

  // Fetch the latest event snapshot to get full details
  const eventSnap = await db.collection("events").doc(eventId).get();
  if (!eventSnap.exists) throw new Error(`Event ${eventId} not found`);
  const eventData = eventSnap.data();

  // Generate ICS file
  const icsFile = generateICS({
    eventName: eventData.eventName,
    eventDate: eventData.eventDate,
    eventEndDate: eventData.eventEndDate || eventData.eventDate, // fallback
    remarks: eventData.remarks,
    organiserEmail: eventData.organiserEmail,
  });


const eventDateJS = eventData.eventDate?._seconds
  ? new Date(eventData.eventDate._seconds * 1000)
  : new Date(eventData.eventDate);

const regDeadlineJS = eventData.regDeadline?._seconds
  ? new Date(eventData.regDeadline._seconds * 1000)
  : new Date(eventData.regDeadline);

  // Create a formatted HTML email
  const buildEmailBody = (participantName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
    <h2 style="color: #2c3e50;">📢 Event Update: ${eventData.eventName}</h2>
    <p>Dear <strong>${participantName}</strong>,</p>
    <p>The event you registered for has been <strong>updated</strong>. Here are the latest details:</p>
    
    <table style="width:100%; border-collapse: collapse; margin: 15px 0;">
      <tr><td><strong>🗓 Date:</strong></td><td>${eventDateJS.toLocaleString()}</td></tr>
      <tr><td><strong>⏰ Registration Deadline:</strong></td><td>${regDeadlineJS.toLocaleString()}</td></tr>
      <tr><td><strong>📝 Remarks:</strong></td><td>${eventData.remarks || "—"}</td></tr>
    </table>

    <p style="margin-top: 20px;">You will also find a <strong>.ics calendar invite</strong> attached to this email. You can add the event directly to your Google/Outlook calendar.</p>
    
    <p style="margin-top: 20px;">Regards,<br/>Event Organiser Team</p>
  </div>
`;
  // Send mail to all participants
  const results = [];
  for (const p of participants) {
    try {
      const res = await sendMail(
        p.email,
        `Update: ${eventData.eventName}`,
        buildEmailBody(p.name || "Participant"),
        [icsFile]
      );
      results.push({ email: p.email, status: "sent", info: res });
    } catch (err) {
      results.push({ email: p.email, status: "failed", error: err.message });
    }
  }

  return {
    eventId,
    recipientsCount: participants.length,
    results,
  };
}

/* ---------------------------
   Registration Functions
--------------------------- */

/**
 * registerParticipant
 * Registers a participant, generates QR code + ICS invite, sends registration email
 */export async function registerParticipant(eventId, participantData) { 
  if (!eventId || !participantData?.name || !participantData?.email) {
    throw new Error("eventId, name, and email are required");
  }

  const docRef = db.collection("events").doc(eventId);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error(`Event ${eventId} not found`);

  const eventData = snap.data();
  const now = new Date();

  // Convert Firestore timestamps to JS Date
  const eventDateJS = eventData.eventDate?.toDate ? eventData.eventDate.toDate() : new Date(eventData.eventDate);
  const regDeadlineJS = eventData.regDeadline?.toDate ? eventData.regDeadline.toDate() : new Date(eventData.regDeadline);

  // Check registration deadline
  if (regDeadlineJS && regDeadlineJS < now) {
    throw new Error("Registration deadline has passed");
  }

  const participants = eventData.participants || [];

  // Check for duplicate email
  if (participants.some(p => p.email.toLowerCase() === participantData.email.toLowerCase())) {
    throw new Error("Participant with this email already registered");
  }

  // Create participant object
  const participantId = uuidv4();
  const qrCodeBase64 = await generateQRCodeBase64(participantId);

  const participantObj = {
    id: participantId,
    name: participantData.name,
    email: participantData.email,
    regId: participantId,
    qrCodeUrl: qrCodeBase64, // store base64 for simplicity
    attendance: false,
    checkInTime: null
  };

  // Update event doc participants array
  await docRef.update({
    participants: FieldValue.arrayUnion(participantObj)
  });

  // ---------------- NEW CODE START ----------------
  // Update user's registration history
  const userRef = db.collection("users").doc(participantData.email);
  await userRef.set(
    {
      email: participantData.email,
      name: participantData.name,
      registrations: FieldValue.arrayUnion({
        eventId,
        eventName: eventData.eventName,
        regDate: Timestamp.now(),
        remarks: eventData.remarks || "—",
        eventDate: eventData.eventDate || null
      })
    },
    { merge: true } // merge so we don’t overwrite old data
  );
  // ---------------- NEW CODE END ------------------

  // Generate ICS file
  const icsFile = generateICS({
    eventName: eventData.eventName,
    eventDate: eventDateJS,
    remarks: eventData.remarks,
    organiserEmail: eventData.organiserEmail
  });

  // Build registration email HTML
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
      <h2 style="color: #2c3e50;">✅ Registration Successful: ${eventData.eventName}</h2>
      <p>Dear <strong>${participantData.name}</strong>,</p>
      <p>Thank you for registering for the event. Here are your registration details:</p>

      <table style="width:100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td><strong>Event:</strong></td><td>${eventData.eventName}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${eventDateJS.toLocaleString()}</td></tr>
        <tr><td><strong>Remarks:</strong></td><td>${eventData.remarks || "—"}</td></tr>
      </table>

      <p>Your <strong>QR code</strong> for event check-in is attached below. Please keep it safe and present it at the event for attendance:</p>
      <img src="cid:qrcode@event" alt="QR Code" style="width:150px; height:150px;" />

      <p>You will also find a <strong>.ics calendar invite</strong> attached. Add it to your Google/Outlook calendar.</p>

      <p>Regards,<br/>Event Organiser Team</p>
    </div>
  `;

  // Send email with QR code (inline) and ICS attachment
  const attachments = [
    {
      filename: "qrcode.png",
      content: Buffer.from(qrCodeBase64.split(",")[1], "base64"),
      cid: "qrcode@event",
    },
    icsFile, // keep ICS as is
  ];

  await sendMail(
    participantData.email,
    `Registration: ${eventData.eventName}`,
    emailHtml,
    attachments
  );

  return participantObj;
}


/**
 * getParticipants
 * Fetch all participants for an event
 */
export async function getParticipants(eventId) {
  if (!eventId) throw new Error("eventId is required");
  const docRef = db.collection("events").doc(eventId);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error(`Event ${eventId} not found`);

  const participants = snap.data().participants || [];
  return participants;
}


/**
 * Marks attendance for a participant
 * @param {string} eventId
 * @param {string} participantId
 * @returns {object} status message
 */
export async function markAttendance(eventId, participantId) {
  if (!eventId || !participantId) throw new Error("eventId and participantId are required");

  const docRef = db.collection("events").doc(eventId);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error(`Event ${eventId} not found`);

  const participants = snap.data().participants || [];
  const index = participants.findIndex(p => p.id === participantId);
  if (index === -1) throw new Error("Participant not found");

  const participant = participants[index];

  if (participant.attendance) {
    // Convert Firestore Timestamp to JS Date
    const checkInTime = participant.checkInTime?.toDate
      ? participant.checkInTime.toDate()
      : participant.checkInTime
      ? new Date(participant.checkInTime)
      : null;

    return {
      success: false,
      message: `Already checked in at ${checkInTime?.toLocaleString() || "Unknown time"}`
    };
  }

  const now = new Date();
  participants[index].attendance = true;
  participants[index].checkInTime = now;

  await docRef.update({ participants });

  return {
    success: true,
    message: `Check-in successful at ${now.toLocaleString()}`,
    participant: participants[index]
  };
}

export async function exportAttendance(eventId) {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnap = await eventRef.get();

  if (!eventSnap.exists) {
    return { success: false, message: "Event not found" };
  }

  const eventData = eventSnap.data();
  const participants = eventData.participants || [];

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");

  // Header branding
  sheet.mergeCells("A1:E1");
  sheet.getCell("A1").value = "NextPass Event Management System";
  sheet.getCell("A1").font = { bold: true, size: 14 };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.mergeCells("A2:E2");
  sheet.getCell("A2").value = "Built with ❤️ by Anurag Anand";
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.addRow([]);
  sheet.addRow([`Event Name: ${eventData.eventName}`]);
  sheet.addRow([`Event Date: ${eventData.eventDate?.toDate()}`]);
  sheet.addRow([`Organiser: ${eventData.organiserEmail}`]);
  sheet.addRow([]);

  // Table header
  sheet.addRow(["Name", "Email", "ID", "Attendance", "Check-in Time"]);
  const headerRow = sheet.getRow(sheet.lastRow.number);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  // Fill rows
  participants.forEach((p) => {
    sheet.addRow([
      p.name,
      p.email,
      p.id,
      p.attendance ? "Present" : "Absent",
      p.checkInTime
        ? new Date(p.checkInTime._seconds * 1000).toLocaleString()
        : "—",
    ]);
  });

  sheet.columns.forEach((col) => {
    col.width = 25;
  });

  // Return file buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    success: true,
    fileBuffer: buffer,
    fileName: `${eventId}_attendance.xlsx`,
  };
}


// Get all available events (for participants to browse)
export async function getAvailableEvents() {
  try {
    const snapshot = await db.collection("events").get();
    const now = new Date();
    const availableEvents = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const { eventName, organiserEmail, eventDate, regDeadline, remarks } = data;

      // Convert Firestore Timestamp → JS Date
      const eventDateObj = eventDate?.toDate ? eventDate.toDate() : new Date(eventDate);
      const deadlineObj = regDeadline?.toDate ? regDeadline.toDate() : new Date(regDeadline);

      // Only include events where deadline & event date are still in future
      if (deadlineObj >= now && eventDateObj >= now) {
        availableEvents.push({
          id: doc.id, // eventId
          eventName,
          organiserEmail,
          eventDate: eventDateObj,
          regDeadline: deadlineObj,
          remarks,
        });
      }
    });

    return availableEvents;
  } catch (err) {
    console.error("Error fetching available events:", err);
    throw err;
  }
}


// Fetch all registrations for a given user (participant)
export async function getRegistrationsByUser(userEmail) {
  if (!userEmail) throw new Error("userEmail is required");

  const userRef = db.collection("users").doc(userEmail);
  const snap = await userRef.get();

  if (!snap.exists) {
    return []; // no user found, return empty array
  }

  const userData = snap.data();
  return userData.registrations || [];
}
