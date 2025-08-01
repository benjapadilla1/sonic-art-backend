import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      process.env.FIREBASE_ADMIN_KEY || "./firebase.json"
    ),
  });
}

const db = admin.firestore();

export { db };
export default admin;
