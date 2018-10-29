const path = require('./path');
const reference = require('./reference');
const component = require('./component');

class document extends component  {

  /**
  * This class is a high level representation of a firestore document.
  * Path parameters wrapped in curly brackets are supported.
  * @class document
  * @param {string/path} pathInput is a path wich may include parameters. Can be either a string or path object.
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
  * @param {Object} options to customize how data is updated. Pass options with batch: aWriteBatchObject to add this write operation to a Firestore WriteBatch instead.
  * @return {Promise} resolves once data is successfully updated.
  */
  update(data, options={}){
    if(options.batch){
      return options.batch.update(this.reference, data, options);
    }
    return this.reference.update(data);
  }

  /**
  * Retrieves existing data at this path in database.
  * @return {Promise} resolves with [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  * @example
  */
  get(){
    return this.reference.get();
  }

  /**
  * Creates a copy of this document with the option to
  * fullfil path parameters with provided data & map.
  * @param {object} data from which arguments for path parameters will be extracted.
  * @param {object} map path parameter names to relevant data property names.
  * @return {document}
  * @example
  * new document('users/{userId}').instance({uid: 'zach123'}, {userId: 'uid'});
  */
  instance(data, map){
    return new document(this._path.insertArgs(data, map));
  }

  /**
  * A map of potential document errors.
  * @override
  * @return {Object} map of error objects
  */
  static get errors(){
    return {
      badPath: new Error("Make sure provided document paths have even depth and are of the standard path format."),
      badTriggerInput: new Error("Document trigger functions (e.g. onCreate, onWrite) only accept non-null handlers."),
    };
  };


}


module.exports = document;
