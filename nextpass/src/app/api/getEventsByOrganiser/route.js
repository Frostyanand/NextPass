import { NextResponse } from "next/server";
import { getEventsByOrganiser } from "@/app/backend";

export async function POST(req) {
  try {
    const { organiserEmail } = await req.json();

    if (!organiserEmail) {
      return NextResponse.json({ error: "Missing organiserEmail" }, { status: 400 });
    }

    const events = await getEventsByOrganiser(organiserEmail);

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Error in getEventsByOrganiser API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
