// import admin from "firebase-admin";

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     }),
//   });
// }

// export const db = admin.firestore();


import admin from 'firebase-admin';

// This is the correct, modern way to handle Firebase credentials in a serverless environment.

// 1. We will store the entire service account JSON as a single, Base64-encoded environment variable.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountString) {
  // This error will be very clear in the Vercel logs if you forget to set the variable.
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set. Please follow the setup instructions.');
}

// 2. We decode the Base64 string back into a JSON object that Firebase can understand.
// This is much more reliable than replacing newline characters.
const serviceAccount = JSON.parse(Buffer.from(serviceAccountString, 'base64').toString('utf-8'));

// 3. The singleton pattern: Initialize Firebase Admin only if it hasn't been already.
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

// 4. Export the initialized firestore instance for use in your API routes.
export const db = admin.firestore();
