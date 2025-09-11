import { NextResponse } from "next/server";
import { getRegistrationsByUser } from "@/app/backend";

export async function POST(req) {
  try {
    const { userEmail } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    }

    const registrations = await getRegistrationsByUser(userEmail);

    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error("Error in getUserRegistrations API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
