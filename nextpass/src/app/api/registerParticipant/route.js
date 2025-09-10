import { NextResponse } from "next/server";
import { registerParticipant } from "@/app/backend"; // your single backend script

export async function POST(req) {
  try {
    const body = await req.json();
    const { eventId, participantData } = body;
    const { name, email } = participantData || {};

    if (!eventId || !name || !email) {
      return NextResponse.json(
        { error: "eventId, name, and email are required" },
        { status: 400 }
      );
    }

    const participant = await registerParticipant(eventId, { name, email });

    return NextResponse.json({ success: true, participant });
  } catch (err) {
    console.error("Error in registerParticipant API:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
