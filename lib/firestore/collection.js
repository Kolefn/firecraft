const functions = require('firebase-functions');
const firebaseTools = require('firebase-tools');
const {extractData} = require('./util');
const path = require('./path');
const reference = require('./reference');
const component = require('./component');
const query = require('./query');
class collection extends component {

  /**
  * This class is a high level representation of a firestore collection.
  * Path parameters wrapped in curly brackets are supported.
  * @class collection
  * @param {string/path} pathInput is a path string wich may include parameters. Can be either a string or path object.
  * @example
  * new collection("users/{userId}/characters/{characterId}/achievements");
  */
  constructor(pathInput){
    super();
    if(typeof pathInput == 'string'){ this._path = new path(pathInput); }
    else if(pathInput){ this._path = pathInput; }
    if(!this._path || this._path.isEven === true){ throw collection.errors.badPath }
  }

  /**
  * Gets a firestore reference object from this collection's path.
  * @return {CollectionReference} [See API]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.CollectionReference}
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
  * Creates a copy of this collection with the option to
  * fullfil path parameters with provided data & map.
  * @param {object} data [Change]{@link https://firebase.google.com/docs/reference/functions/functions.Change} or [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/functions/functions.firestore.DocumentSnapshot} or plain Object from which arguments for path parameters will be extracted.
  * @param {object} map path parameter names to relevant data property names.
  * @return {collection}
  * @example
  * new collection('users/{userId}/characters/{characterId}').instance({uid: 'zach123', characterId: 'zabeebo'}, {userId: 'uid'});
  */
  instance(data, map){
    data = extractData(data);
    return new collection(this._path.insertArgs(data, map));
  }


  /**
  * Retrieves all documents in this collection which match the query parameters provided.
  * If no options are provided, all documents in the collection will be fetched.
  * @param {Object} options with paramters for each query method [See Query API]{@link https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/Query}
  * @return {QuerySnapshot} [See API]{@link https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/QuerySnapshot}
  */
  get(options){
    let qry = new query(this.reference, options);
    return qry.get();
  }
  /**
  * Matches the CollectionReference add [API]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.CollectionReference#add }
  * @param {Object} data to be written
  * @return {Promise}
  */
  add(data){
    return this.reference.add(data);
  }

  /**
  * Shallow delete all documents in this collection. Recursively deep deletes
  * all documents under this collection if recursive flag set in options.
  *
  * This delete is NOT an atomic operation and it's possible
  * that it may fail after only deleting some documents.
  *
  * To avoid accidental deletes due to confusion with document.delete, this function
  * will only run when option 'yes' is set to true.
  *
  * Accesses a token that must be set in the functions config or as the environment variable FIREBASE_CI_TOKEN.
  * Generate a token at the command line by running 'firebase login:ci'.
  * To add the token to your functions config simply run
  * 'firebase functions:config:set fb.token=GENERATEDTOKEN' via cli in the functions folder.
  * @param {Object} options {recursive: true, yes: false}
  * @return {Promise} resolves when delete operation is successful
  */
  delete(options={}){
    if(options.recursive == undefined || options.recursive == null){ options.recursive == true}
    if(options.yes !== true){ return Promise.reject(collection.errors.deleteYesOptionNotSet)}
    return firebaseTools.firestore.delete(this._path.toString(), {
        project: process.env.GCLOUD_PROJECT,
        recursive: options.recursive,
        yes: true,
        token: process.env.FIREBASE_CI_TOKEN || functions.config().fb.token
      });
  }


  /**
  * Executes the provided function for each document in this collection
  * that meets the query specifications. A query limit is set by default and
  * documents will be iterated in batches of such size until the returned QuerySnapshot is empty.
  * @param {Function} task to be executed for each document.
    The task function is passed a DocumentSnapshot, followed by an index value. The task function may return a promise for iteration
    to continue after resolve, and break the iteration after rejection.
  * @param {Object} options with defaults {limit: 20}
  * @return {Promise} resolves when all document batches have been iterated. Rejects with the last document of iteration.
  */
  iterate(task, options={}){
    let limitSet = options.limit >= 0 && options.limit !== null;
    if(!limitSet){ options.limit = 20; }
    let qry = new query(this.reference, options);
    return this._iterateBatches(qry, task);
  }

  /**
  * This is a utility function for collection.iterate. It uses recursion to synchronously
  * fetch and iterate batches of documents returned from a collection query.
  * @param {query} qry
  * @param {Function} task
  * @param {Number} index
  * @return {Promise}
  */
  _iterateBatches(qry, task, index=0){
    return qry.get().then((snapshot)=> {
      if(snapshot.size == 0){ return Promise.resolve(); }
      let lastDoc = snapshot.docs[snapshot.size-1];
      return this._iterateDocs(snapshot.docs, task, index).then((i)=> {
        if(snapshot.size < qry.limit){ return Promise.resolve(); }
        qry.startAfter(lastDoc);
        return new Promise((resolve, reject) => process.nextTick(()=> this._iterateBatches(qry, task, i).then(resolve).catch(reject)));
      });
    });
  }

  /**
  * This is a utility function for collection.iterate. It uses recursion to synchronously
  * iterates an array of documents, allowing for the input task to complete before moving forward.
  * A standard asynchronous for-loop will be used if the task function does not return a promise.
  * @param {Array} docs
  * @param {Function} task
  * @param {Number} index
  * @return {Promise}
  */
  _iterateDocs(docs, task, index){
    let doc = docs.shift();
    try {
      let taskReturn = task(doc, index);
      let isPromise = taskReturn instanceof Promise;
      if(!isPromise){
          for(let d of docs){
            index++;
            task(d, index);
          }
          return Promise.resolve(index);
      }
      return taskReturn.then(()=> {
        if(docs && docs.length > 0){
          index++;
          let customReject = ()=> reject(docs[index]);
          return new Promise((resolve, reject) => process.nextTick(()=> this._iterateDocs(docs, task, index).then(resolve).catch(reject)));
        }else {
          return Promise.resolve(index);
        }
      }).catch(()=> {
        return Promise.reject(docs[index]);
      });
    }catch(e){
      return Promise.reject(docs[index]);
    }
  }

  /**
  * A map of potential collection errors.
  * @override
  * @return {Object} map of error objects
  */
  static get errors(){
    return {
      deleteYesOptionNotSet: new Error("Attempt to call delete() on collection without setting 'yes' option to true."),
      badPath: new Error("Make sure collection paths have odd depth and are of the standard path format."),
    };
  };
}

module.exports = collection;
