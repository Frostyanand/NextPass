import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import { db } from "@/lib/firebase";

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

/* ---------------------------
   Placeholder mailer
   --------------------------- */
export async function sendUpdateEmails(eventId, updatedFields, participants = []) {
  console.log(`[placeholder] sendUpdateEmails called for ${eventId}`);
  return {
    note: "placeholder - implement sendMail + generateICS",
    eventId,
    updatedFields,
    recipientsCount: participants.length,
    sampleRecipients: participants.slice(0, 10).map(p => ({
      name: p.name,
      email: p.email,
      id: p.id
    }))
  };
}
