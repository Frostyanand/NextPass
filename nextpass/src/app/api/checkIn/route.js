import { NextResponse } from "next/server";
import { markAttendance } from "@/app/backend";

export async function POST(req) {
  try {
    const { eventId, participantId } = await req.json();

    if (!eventId || !participantId) {
      return NextResponse.json(
        { error: "eventId and participantId are required" },
        { status: 400 }
      );
    }

    const result = await markAttendance(eventId, participantId);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in markAttendance API:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
