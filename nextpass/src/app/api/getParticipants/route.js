import { NextResponse } from "next/server";
import { getParticipants } from "@/app/backend"; // your single backend script

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId query parameter is required" },
        { status: 400 }
      );
    }

    const participants = await getParticipants(eventId);

    return NextResponse.json({ success: true, participants });
  } catch (err) {
    console.error("Error in getParticipants API:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
