// src/lib/calendar.js
import { v4 as uuidv4 } from "uuid";

/**
 * Generate an ICS calendar invite for an event
 * @param {object} event - Event details
 * @param {string} event.eventName
 * @param {Date|string} event.eventDate - start datetime (UTC or ISO string)
 * @param {Date|string} event.eventEndDate - optional end datetime
 * @param {string} event.remarks
 * @param {string} event.organiserEmail
 * @returns {{ filename: string, content: string }}
 */
export function generateICS(event) {
  const {
    eventName,
    eventDate,
    eventEndDate,
    remarks = "",
    organiserEmail = "no-reply@example.com",
  } = event;

  // Ensure date is in proper ICS UTC format (YYYYMMDDTHHmmssZ)
  const formatICSDate = (d) =>
    new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const start = formatICSDate(eventDate);
  const end = eventEndDate ? formatICSDate(eventEndDate) : start;

  const uid = uuidv4();

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NextPass//Event System//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${uid}
SUMMARY:${eventName}
DTSTART:${start}
DTEND:${end}
DESCRIPTION:${remarks}
ORGANIZER;CN=Event Organiser:MAILTO:${organiserEmail}
END:VEVENT
END:VCALENDAR`;

  return {
    filename: `${eventName.replace(/\s+/g, "_")}.ics`,
    content: icsContent,
  };
}
