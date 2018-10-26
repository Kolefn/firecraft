const admin = require('../admin');
const collection = require('./collection');
const dataStruct = require('./dataStruct');
const database = admin.firestore;

class document extends dataStruct {

  /**
  * This class is a high level representation of a firestore document.
  * Path parameters wrapped in curly brackets are supported.
  * @class document
  * @param {string} path is a path wich may include parameters.
  * @example
  * new document("users/{userId}/characters/{characterId}");
  */
  constructor(path){
    super(path);
    this._onCreateHandlers = [];
    this._onDeleteHandlers = [];
    this._onUpdateHandlers = [];
    this._onWriteHandlers = [];
  }

  /**
  * Registers a function to fire when a document matching this path is created.
  * @param {function} handler that will be called on create.
  * @return {document} this document
  * @example
  * doc.onCreate((snapshot)=> docToCreate.instance(snapshot.data()).set(snapshot.data()));
  */
  onCreate(handler){
    if(handler == null || handler == undefined || typeof handler != 'function'){
      throw document.errors.badTriggerInput
    }

    this._onCreateHandlers.push(handler);

    return this;
  }

  /**
  * Registers a function to fire when a document matching this path is deleted.
  * @param {function} handler that will be called on delete.
  * @return {document} this document
  * @example
  * doc.onDelete((snapshot)=> docToDelete.instance(snapshot.data()).delete());
  */
  onDelete(handler){
    if(handler == null || handler == undefined || typeof handler != 'function'){
      throw document.errors.badTriggerInput
    }

    this._onDeleteHandlers.push(handler);

    return this;
  }

  /**
  * Registers a function to fire when a document matching this path is updated.
  * @param {function} handler that will be called on update.
  * @return {document} this document
  * @example
  * doc.onUpdate((change, context)=> docToUpdate.instance(change.after.data()).update({lastUpdated: context.timestamp}));
  */
  onUpdate(handler){
    if(handler == null || handler == undefined || typeof handler != 'function'){
      throw document.errors.badTriggerInput
    }

    this._onUpdateHandlers.push(handler);

    return this;
  }

  /**
  * Registers a function to fire when a document matching this path is created/deleted/updated.
  * @param {function} handler that will be called on write.
  * @return {document} this document
  */
  onWrite(handler){
    if(handler == null || handler == undefined || typeof handler != 'function'){
      throw document.errors.badTriggerInput
    }

    this._onWriteHandlers.push(handler);

    return this;
  }

  /**
  * Writes data to this path in the database.
  * @param {Object} data to be written at this path.
  * @param {Object} options to customize how data is written.
  * @return {Promise} resolves with void once data is succesfully written.
  */
  set(data, options){
    return this.reference.set(data, options);
  }

  /**
  * Retrieves existing data at this path in database.
  * @return {Promise} resolves with [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  get(){
    return this.reference.get();
  }


  /**
  * Builds a firestore reference object from this document's path.
  * @override
  * @return {DocumentReference} [See API]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  _toReference(){
    let lastIndex = this._pathSegments.length-1;
    let col = this._pathSegments.slice(0, lastIndex).join("/");
    let docId = this._pathSegments.slice(lastIndex)[0];
    return database.collection(col).doc(docId);
  }

  /**
  * A map of potential document errors.
  * @override
  * @return {Object} map of error objects
  */
  static get errors(){
    return Object.assign(super.errors, {
      badPath: new Error("Make sure provided document paths have even depth and are of the standard path format."),
      badTriggerInput: new Error("Document trigger functions (e.g. onCreate, onWrite) only accept non-null handlers."),
    });
  };

  /**
  * Determines if the provided path is a valid path.
  * @override
  * @param {Array} pathSegments of the document
  * @return {bool} if the path is valid.
  */
  static isValidPath(pathSegments){
    super.isValidPath(pathSegments);
    return pathSegments.length % 2 == 0;
  }

  /**
  *@override
  *@return {collection} class
  */
  static get childClass(){
    return collection;
  }

}


module.exports = document;
