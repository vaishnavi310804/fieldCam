import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseAdminApp = null;

const parseServiceAccount = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch (err1) {
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (err2) {
      console.warn(
        "[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:",
        err1.message
      );
      return null;
    }
  }
};

const initializeFirebaseAdmin = () => {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // 1. Try environment variable FIREBASE_SERVICE_ACCOUNT (raw JSON string or base64 encoded JSON)
  const serviceAccountFromEnv = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (serviceAccountFromEnv) {
    try {
      const app = initializeApp({
        credential: cert(serviceAccountFromEnv),
      });
      console.log(
        `[Firebase Admin] Initialized successfully via FIREBASE_SERVICE_ACCOUNT (${serviceAccountFromEnv.project_id || "default"}).`
      );
      return app;
    } catch (error) {
      console.error(
        "[Firebase Admin] Initialization failed with FIREBASE_SERVICE_ACCOUNT:",
        error.message
      );
      return null;
    }
  }

  // 2. Try filesystem credential file (FIREBASE_CREDENTIALS_PATH or default path)
  const defaultCredentialPath = path.resolve(
    __dirname,
    "../../credentials/fieldcam-9c3e1-firebase-adminsdk-fbsvc-ce826a2997.json"
  );
  const credentialPath = process.env.FIREBASE_CREDENTIALS_PATH
    ? path.resolve(process.cwd(), process.env.FIREBASE_CREDENTIALS_PATH)
    : defaultCredentialPath;

  if (fs.existsSync(credentialPath)) {
    try {
      const rawData = fs.readFileSync(credentialPath, "utf-8");
      const serviceAccount = JSON.parse(rawData);
      const app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log(
        `[Firebase Admin] Initialized successfully from file: ${path.basename(credentialPath)} (${serviceAccount.project_id || "default"}).`
      );
      return app;
    } catch (error) {
      console.error(
        "[Firebase Admin] Initialization failed from credential file:",
        error.message
      );
      return null;
    }
  }

  console.warn(
    "[Firebase Admin] No service account credentials found. Push notifications will be disabled."
  );
  return null;
};

firebaseAdminApp = initializeFirebaseAdmin();

export default firebaseAdminApp;
export { firebaseAdminApp, initializeFirebaseAdmin, getApps };