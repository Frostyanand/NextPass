import admin from 'firebase-admin';

// This is the single source of truth for all Firebase Admin functionality.

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountString) {
  // This error will be very clear in the Vercel logs if you forget to set the variable.
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set. Please follow the setup instructions.');
}

// We decode the Base64 string back into a JSON object that Firebase can understand.
// This is much more reliable than replacing newline characters.
const serviceAccount = JSON.parse(Buffer.from(serviceAccountString, 'base64').toString('utf-8'));

// The singleton pattern: Initialize Firebase Admin only if it hasn't been already.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin Initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

// Export all the necessary Firebase Admin components from this central file.
export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

