const admin = require('firebase-admin');
/**
* initialize app if has not already before admin is exported.
* First checks for a certificate environment variables - falls back to using
* the local json. The env. variables are only set on the CI server.
*/
try {
  let cert = {};
  if(process.env.FIREBASE_PRIVATE_KEY){
    cert.privateKey = process.env.FIREBASE_PRIVATE_KEY;
    cert.projectId = process.env.FIREBASE_PROJECT_ID;
    cert.clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  }else if(!cert){
    cert = require('../../../KoleCreates/kolecreates-firebase-service-key.json')
  }
  admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: "https://kolecreates.firebaseio.com"
  });
}catch(e){
  //already initialized
}

//module.exports = admin;

const firestore = admin.firestore();
firestore.settings({/* your settings... */ timestampsInSnapshots: true});

module.exports = { firestore };
