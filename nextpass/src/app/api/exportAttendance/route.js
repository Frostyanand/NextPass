import { NextResponse } from "next/server";
import { exportAttendance } from "@/app/backend";

export async function POST(req) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Missing eventId" },
        { status: 400 }
      );
    }

    // Run backend export function
    const { success, fileBuffer, fileName, message } = await exportAttendance(eventId);

    if (!success) {
      return NextResponse.json({ success, message }, { status: 404 });
    }

    // Return file as downloadable response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${fileName}`,
      },
    });
  } catch (error) {
    console.error("Error exporting attendance:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
