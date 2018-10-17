const functions = require('../lib/functions');



let docs = functions.firestore.createDocuments({name: 'path/to/document'});

console.log(docs);
