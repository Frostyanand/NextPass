import { NextResponse } from "next/server";
import { updateEvent } from "@/app/backend";

export async function POST(req) {
  try {
    const { eventId, updatedFields } = await req.json();

    if (!eventId || !updatedFields) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await updateEvent(eventId, updatedFields);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in updateEvent API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
