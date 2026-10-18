import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = fs.existsSync(path.resolve(__dirname, "../serviceAccountKey.json"))
  ? path.resolve(__dirname, "../serviceAccountKey.json")
  : path.resolve("serviceAccountKey.json");

const serviceAccount = fs.existsSync(serviceAccountPath)
  ? JSON.parse(readFileSync(serviceAccountPath, "utf8"))
  : null;

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log(" Firebase Admin initialized successfully!");
}

export default admin;