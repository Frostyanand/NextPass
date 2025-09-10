// src/app/firebase-test.js
import { db } from "@/lib/firebase";

export async function testFirebase() {
  try {
    // Simple write + read
    const ref = db.collection("test").doc("ping");
    await ref.set({ msg: "Hello from Firebase!", time: new Date().toISOString() });

    const snap = await ref.get();
    console.log("✅ Firebase connection successful:", snap.data());
  } catch (err) {
    console.error("❌ Firebase connection failed:", err.message);
  }
}
