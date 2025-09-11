import { NextResponse } from "next/server";
import { getAvailableEvents } from "@/app/backend";

export async function GET() {
  try {
    const events = await getAvailableEvents();
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Error in getAvailableEvents API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
