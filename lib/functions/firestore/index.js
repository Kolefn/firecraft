/**
* This module contains references to firestore sub-modules and utilities.
* @module firestore
*/

module.exports.collection = require('./collection');


/**
* Provides batch creation of documents from generic paths.
* @param {Object} paths a key-value map of document paths
* @returns {Object} a key-value map of document objects
*/
module.exports.createDocuments = (paths) => {
  let documents = {};
  for(let name in paths){
    let path = paths[name];
    documents[name] = new module.exports.collection.document(path);
  }
  return documents;
};
