import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseAdminApp = null;

const initializeFirebaseAdmin = () => {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const defaultCredentialPath = path.resolve(
    __dirname,
    "../../credentials/fieldcam-9c3e1-firebase-adminsdk-fbsvc-ce826a2997.json"
  );

  const credentialPath =
    process.env.FIREBASE_CREDENTIALS_PATH || defaultCredentialPath;

  if (!fs.existsSync(credentialPath)) {
    console.warn(
      `[Firebase Admin] Service account credential file not found at: ${credentialPath}`
    );
    return null;
  }

  try {
    const rawData = fs.readFileSync(credentialPath, "utf-8");
    const serviceAccount = JSON.parse(rawData);

    firebaseAdminApp = initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully.");
    return firebaseAdminApp;
  } catch (error) {
    console.error("[Firebase Admin] Initialization failed:", error.message);
    return null;
  }
};

firebaseAdminApp = initializeFirebaseAdmin();

export default firebaseAdminApp;
export { firebaseAdminApp, getApps };