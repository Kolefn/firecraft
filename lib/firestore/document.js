const path = require('./path');
const reference = require('./reference');

class document {

  /**
  * This class is a high level representation of a firestore document.
  * Path parameters wrapped in curly brackets are supported.
  * @class document
  * @param {string/path} pathInput is a path wich may include parameters. Can be either a string or path object.
  * @example
  * new document("users/{userId}/characters/{characterId}");
  */
  constructor(pathInput){
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
  * Defines a new function to be called on this class.
  * @param {string} name what this node shall be called.
  * @param {function} func what this node will do.
  * Things to note when using the new node:
  * The calling instance will be automatically inserted as the first argument.
  * The calling instance will be returned by default if the provided function does not return anything.
  * @example
  * node('add', (doc, number) => doc.transaction((t, doc)=> t.update(doc.ref, doc.data().value + number)));
  * @static
  */
  static node(name, func){
    this.prototype[name] = function(...args){
      let providedFunctionReturn = func(this, ...args);
      if(providedFunctionReturn == undefined){
        return this;
      }else{
        return providedFunctionReturn;
      }
    }
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
