const functions = require('firebase-functions');
/**
* This module contains references to firestore sub-modules and utilities.
* @module firestore
*/

module.exports.collection = require('./collection');
module.exports.document = require('./document');
module.exports.batch = require('./batch');

/**
* Get the parent collection object for this document.
* Creates the collection if it does not exist.
* @return {collection} parent
*/
Object.defineProperty(module.exports.document.prototype, "parent", {
    get: function parent() {
      if(this._parent){ return this._parent; }
      this._parent = new module.exports.collection(this._path.parent());
      return this._parent;
    }
});

/**
* Get the parent document object for this collection.
* Creates the document if it does not exist.
* @return {document} parent
*/
Object.defineProperty(module.exports.collection.prototype, "parent", {
    get: function parent() {
      if(this._parent){ return this._parent; }
      this._parent = new module.exports.document(this._path.parent());
      return this._parent;
    }
});

/**
* create a new child collection to this document
* @param {string} relativePath to the collection
* @return {collection}
*/
module.exports.document.prototype.collection = function(relativePath){
  let collectionPath = this._path.child(relativePath);
  return new module.exports.collection(collectionPath);
}

/**
* create a new child document to this collection
* @param {string} relativePath to the document
* @return {document}
*/
module.exports.collection.prototype.document = function(relativePath){
    let documentPath = this._path.child(relativePath);
    return new module.exports.document(documentPath);
}

/**
* All documents that will have their trigger handlers exported.
*/
let documents = {};

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
