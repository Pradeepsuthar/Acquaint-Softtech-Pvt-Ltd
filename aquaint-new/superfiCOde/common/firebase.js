import * as admin from "firebase-admin";
const serviceAccount = require("./../config/superfi-web-firebase-adminsdk-4vhrc-3baf1814f3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
