const functions = require('firebase-functions');
const firecraft = require('./lib');
firecraft.admin.firestore.settings({/* your settings... */ timestampsInSnapshots: true});
firecraft.admin.initializeApp("https://kolecreates.firebaseio.com", "../../../KoleCreates/kolecreates-firebase-service-key.json");
const docs = firecraft.createDocuments(require('./paths'));
exports = firecraft.export();
