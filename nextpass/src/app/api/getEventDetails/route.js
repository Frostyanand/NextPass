import { NextResponse } from "next/server";
import { getEventDetails } from "@/app/backend";

export async function POST(req) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const event = await getEventDetails(eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Error in getEventDetails API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
