const functions = require('../lib/functions');


functions.firestore.collection.node('add', (col, num1, num2) =>  num1 + num2 );
let collection = new functions.firestore.collection("users/{userId}");
let docs = functions.firestore.createDocuments({name: 'path/to/document'});
