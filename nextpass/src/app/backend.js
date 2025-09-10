import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import { db } from "@/lib/firebase";
import { sendMail } from "@/lib/mailer";
import { generateICS } from "@/lib/calendar";

/* ---------------------------
   Utilities
   --------------------------- */
function parseDateField(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d;
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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

  payload.updatedAt = admin.firestore.FieldValue.serverTimestamp();

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

  // Create a formatted HTML email
  const buildEmailBody = (participantName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
      <h2 style="color: #2c3e50;">📢 Event Update: ${eventData.eventName}</h2>
      <p>Dear <strong>${participantName}</strong>,</p>
      <p>The event you registered for has been <strong>updated</strong>. Here are the latest details:</p>
      
      <table style="width:100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td><strong>🗓 Date:</strong></td><td>${new Date(eventData.eventDate).toLocaleString()}</td></tr>
        <tr><td><strong>⏰ Registration Deadline:</strong></td><td>${new Date(eventData.regDeadline).toLocaleString()}</td></tr>
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