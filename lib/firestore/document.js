const admin = require('../admin');
const database = admin.firestore;
const { extractPathParams, injectPathArgs, isValidPath } = require('./util');

class document {

  /**
  * This class is a high level representation of a firestore document.
  * Path parameters wrapped in curly brackets are supported.
  * @class document
  * @param {string} path is a path wich may include parameters.
  * @example
  * new document("users/{userId}/characters/{characterId}");
  */
  constructor(path){
    if(!isValidPath(path)){ throw document.errors.badPath  }
    this._path = path;
    this._params = extractPathParams(path);
    this._onCreateHandlers = [];
    this._onDeleteHandlers = [];
    this._onUpdateHandlers = [];
    this._onWriteHandlers = [];
  }

  get path(){
    return this._path;
  }

  get params(){
    return this._params;
  }

  get reference(){
    if(this._reference){
      return this._reference;
    }else {
      return document.toReference(this.path);
    }
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
    let path = this.path;
    if(typeof data == 'object'){
      path = injectPathArgs(this.path, data, map);
    }
    return new document(path);
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
  * Builds a firestore reference object from a document path.
  * @param {string} path from a document object
  * @return {Reference} a [DocumentReference]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  static toReference(path){
    if(!isValidPath(path)){ throw document.errors.badPath }
    if(path.indexOf('{') > -1){ throw document.errors.badReferencePath }
    let segments = path.split("/");
    let split;
    for(let i = path.length-1; i >= 0; i--){
      if(path[i] == '/'){ split = i; break; }
    }

    let docId = path.substring(split);
    let col = path.substring(0, split);


    return database.collection(col).doc(docId);

  }

  /**
  * Defines a new function to be called on this class.
  * @param {string} name what this node shall be called.
  * @param {function} func what this node will do.
  * The document object will be automatically inserted as the first argument.
  * @example
  * node('child', (doc, childName) => new functions.firestore.collection(doc.path + "/" + childName));
  * @static
  */
  static node(name, func){
    document.prototype[name] = function(...args){
      return func(this, ...args);
    }
  }


  /**
  * A map of potential document errors.
  */
  static get errors(){
    return {
      badPath: new Error("Make sure provided document paths have even depth and are of the standard path format."),
      badTriggerInput: new Error("Document trigger functions (e.g. onCreate, onWrite) only accept non-null handlers."),
      badReferencePath: new Error("A reference cannot contain a path parameter.")
    }
  };


}


module.exports = document;
