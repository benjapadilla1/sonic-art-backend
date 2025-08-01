import admin from "firebase-admin";

const serviceAccountPath =
  process.env.NODE_ENV === "production"
    ? "/etc/secrets/firebase.json"
    : "./firebase.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      process.env.FIREBASE_ADMIN_KEY || serviceAccountPath
    ),
  });
}

const db = admin.firestore();

export { db };
export default admin;
