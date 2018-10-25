const functions = require('firebase-functions');
/**
* This module contains references to firestore sub-modules and utilities.
* @module firestore
*/

/**
* All documents that will have their trigger handlers exported.
*/
let documents = {};

module.exports.collection = require('./collection');
module.exports.document = require('./document');
module.exports.util = require('./util');


/**
* Provides batch creation of documents from generic paths.
* @param {Object} paths a key-value map of document paths
* @returns {Object} a key-value map of document objects
*/
module.exports.createDocuments = (paths) => {
  for(let name in paths){
    let path = paths[name];
    documents[name] = new module.exports.document(path);
  }
  return documents;
};


/**
* Export all available trigger handlers for each document as firestore cloud functions.
* Will support optimization/aggregation/naming options in the future.
* @return {Object} map of cloud functions
*/
module.exports.export = () => {
  let toBeExported = {};
  for(let key in documents){
    let doc = documents[key];
    let builder = functions.firestore.document(doc.path);
    let triggers = ['onWrite', 'onCreate', 'onDelete', 'onUpdate'];
    for(let trigger of triggers){
      let handlers = doc["_" + trigger + "Handlers"];
      if(handlers && handlers.length > 0){
        let exportName = key + trigger[0].toUpperCase() + trigger.substring(1);
        toBeExported[exportName] = builder[trigger]((...args)=> {
          for(let handler of handlers){
            handler(...args);
          }
        });
      }
    }
  }

  return toBeExported;
};
