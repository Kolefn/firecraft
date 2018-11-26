const admin = require('firebase-admin');
const firestore = admin.firestore();
/**
 * Initialize the application.
 * @param {string} databaseURL web address of firebase database. Required unless FIREBASE_DATABASE_URL environment variables is set.
 * @param {string} certificatePath absolute path to admin sdk certificate file. Can be downloaded from firebase console.
 * This is optional if FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL environment variables are set.
 */
module.exports.initializeApp = (databaseURL, certificatePath) => {
  try {
    let cert = {};
    if(process.env.FIREBASE_PRIVATE_KEY){
      cert.privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      cert.projectId = process.env.FIREBASE_PROJECT_ID;
      cert.clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    }else {
      cert = require(certificatePath);
    }
    admin.initializeApp({
    credential: admin.credential.cert(cert),
    databaseURL: process.env.FIREBASE_DATABASE_URL || databaseURl
    });
  }catch(e){
    //already initialized
    console.log(e);
  }
};
module.exports.firestore = firestore;
