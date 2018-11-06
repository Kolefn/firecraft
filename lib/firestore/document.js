const {extractData} = require('./util');
const admin = require('../admin');
const database = admin.firestore;
const path = require('./path');
const reference = require('./reference');
const component = require('./component');

class document extends component  {

  /**
  * This class is a high level representation of a firestore document.
  * Path parameters wrapped in curly brackets are supported.
  * @class document
  * @param {string/path} pathInput is a path wich may include parameters. Can be type string or path object.
  * @example
  * new document("users/{userId}/characters/{characterId}");
  */
  constructor(pathInput){
    super();
    if(typeof pathInput == 'string'){ this._path = new path(pathInput); }
    else if(pathInput){ this._path = pathInput; }
    if(this._path.isEven === false){ throw document.errors.badPath }
    this._onCreateHandlers = [];
    this._onDeleteHandlers = [];
    this._onUpdateHandlers = [];
    this._onWriteHandlers = [];
  }

  /**
  * Get this document's ID string
  * @return {string} id
  */
  get id(){
    return this._path.end;
  }

  /**
  * Gets the firestore reference object for this document
  * @return {DocumentReference} [See API]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  get reference(){
    if(this._reference){
      return this._reference;
    }else {
      this._reference = reference.parse(this._path);
      return this._reference;
    }
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
  * Writes data to this document in the database.
  * @param {Object} data to be written.
  * @param {Object} options to customize how data is written. [See API]{@https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/SetOptions}
  * for options supported by Firestore. Pass options with batch: aWriteBatchObject to add this write operation to a Firestore WriteBatch instead.
  * @return {Promise} resolves with void once data is succesfully written.
  */
  set(data, options={}){
    if(options.batch){
      return options.batch.set(this.reference, data, options);
    }
    return this.reference.set(data, options);
  }

  /**
  * Updates data of this document in the database
  * @param {Object} data to be updated
  * @param {Object} options to customize how data is updated. Pass options with {batch} to add this write operation to a Firestore WriteBatch instead.
  * @return {Promise} resolves once data is successfully updated.
  */
  update(data, options={}){
    if(options.batch){
      return options.batch.update(this.reference, data, options);
    }
    return this.reference.update(data);
  }

  /**
  * Delete this document data from database
  * @param {Object} options to customize how data is deleted. Pass options with {batch} to add this delete operation to a Firestore WriteBatch instead.
  * @return {Promise} resolves once data is successfully deleted.
  */
  delete(options={}){
    if(options.batch){
      return options.batch.delete(this.reference);
    }else{
      return this.reference.delete();
    }
  }

  /**
  * Retrieves existing data at this path in database.
  * @return {Promise} resolves with [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  get(){
    return this.reference.get();
  }

  /**
  * Simpler Firestore transaction. Allows you to make state dependent writes
  * such as increment counters.
  * @param {Function} func called with a [Transaction]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.Transaction}, [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentSnapshot}
  * , and [DocumentReference]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  * @return {Promise} resolves when transaction completes
  * @example
  * new document('users/alexa').transaction((t, doc, ref)=> t.update(ref, {count: doc.data().count + 1}));
  */
  transaction(func){
    let ref = this.reference;
    return database.runTransaction((transaction) => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(ref).then((doc)=> {
          return func(transaction, doc, ref);
        });
    });
  }


  /**
  * Creates a copy of this document with the option to
  * fullfil path parameters with provided data & map.
  * @param {Object} data [Change]{@link https://firebase.google.com/docs/reference/functions/functions.Change} or [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/functions/functions.firestore.DocumentSnapshot} or plain Object from which arguments for path parameters will be extracted.
  * @param {Object} map path parameter names to relevant data property names.
  * @return {document}
  * @example
  * new document('users/{userId}').instance({uid: 'zach123'}, {userId: 'uid'});
  */
  instance(data, map){
    data = extractData(data);
    return new document(this._path.insertArgs(data, map));
  }


  /**
  * Creates a document from a firestore DocumentReference object
  * @param {DocumentReference} ref [See API] {@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  * @return {document}
  */
  static fromReference(ref){
    if(ref.constructor.name !== 'DocumentReference'){ throw document.errors.badReferenceClass }
    let doc = new document(reference.getPath(ref));
    doc._reference = ref;
    return doc;
  }

  /**
  * A map of potential document errors.
  * @override
  * @return {Object} map of error objects
  */
  static get errors(){
    return {
      badReferenceClass: new Error("Can only use fromReference to create documents from a DocumentReference object."),
      badPath: new Error("Make sure provided document paths have even depth and are of the standard path format."),
      badTriggerInput: new Error("Document trigger functions (e.g. onCreate, onWrite) only accept non-null handlers."),
    };
  };


}


module.exports = document;
