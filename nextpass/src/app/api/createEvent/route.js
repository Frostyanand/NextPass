import { NextResponse } from "next/server";
import { createEvent } from "@/app/backend";

export async function POST(req) {
  try {
    const { organiserEmail, eventData } = await req.json();

    if (!organiserEmail || !eventData) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const eventId = await createEvent(organiserEmail, eventData);

    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error("Error in createEvent API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
