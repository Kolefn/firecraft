const admin = require('firebase-admin');
/**
* initialize app if has not already before admin is exported.
*/
try {
  admin.initializeApp({
  credential: admin.credential.cert(require('../../../KoleCreates/kolecreates-firebase-service-key.json')),
  databaseURL: "https://kolecreates.firebaseio.com"
  });
}catch(e){
  //already initialized
}

//module.exports = admin;

const firestore = admin.firestore();
firestore.settings({/* your settings... */ timestampsInSnapshots: true});

module.exports = { firestore };
