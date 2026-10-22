import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
// import serviceAccount from "../../credentials/shopease-651d2-firebase-adminsdk-fbsvc-8afaca108e.json" with { type: "json" };

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const messaging = getMessaging();

export default messaging;