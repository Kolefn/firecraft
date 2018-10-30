const path = require('./path');
const reference = require('./reference');
const component = require('./component');
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
  * @param {object} data from which arguments for path parameters will be extracted.
  * @param {object} map path parameter names to relevant data property names.
  * @return {collection}
  * @example
  * new collection('users/{userId}/characters/{characterId}').instance({uid: 'zach123', characterId: 'zabeebo'}, {userId: 'uid'});
  */
  instance(data, map){
    return new collection(this._path.insertArgs(data, map));
  }


  /**
  * Retrieves all documents in this collection which match the query parameters provided.
  * If no options are provided, all documents in the collection will be fetched.
  * @param {Object} options with paramters for each query method [See Query API]{@link https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/Query}
  * @return {QuerySnapshot} [See API]{@link https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/QuerySnapshot}
  */
  get(options){
    let query = this.reference;
    for(let key in options){
      let val = options[key];
      if(typeof val == 'string' || typeof val == 'number'){
        query = query[key](val);
      }else if(Array.isArray(val)){
        if(val.length % 3 == 0){
          for(let i = 0; i < val.length; i+=3){
            query = query[key](val[i], val[i+1], val[i+2]);
          }
        }else{
          query = query[key](...val);
        }
      }else {
        query = query[key](val);
      }
    }

    return query.get();
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
  * Executes the provided function for each document in this collection
  * that meets the query specifications. A query limit is set by default and
  * documents will be iterated in batches of such size until the returned QuerySnapshot is empty.
  * @param {Function} task to be executed for each document.
    The task function is passed a DocumentSnapshot, followed by an index value. The task function may return a promise for iteration
    to continue after resolve, and break of the iteration after rejection.
  * @param {Object} options with defaults {limit: 20}
  * @return {Promise} resolves when all document batches have been iterated. Rejects with the last document of iteration.
  */
  iterate(task, options={}){
    let limitSet = options.limit >= 0 && options.limit !== null;
    if(!limitSet){ options.limit = 20; }
    let query = new query(this.reference, options);
    this._iterateBatches(query, task);
  }

  /**
  * This is a utility function for collection.iterate. It uses recursion to synchronously
  * fetch and iterate batches of documents returned from a collection query.
  * @param {query} query
  * @param {Function} task
  * @param {Number} index
  * @return {Promise}
  */
  _iterateBatches(query, task, index=0){
    return query.get().then((snapshot)=> {
      if(snapshot.size == 0){ return Promise.resolve(); }
      let lastDoc = snapshot.docs[snapshot.size-1];
      return _iterateDocs(snapshot.docs, task, index).then((i)=> {
        query.startAfter(lastDoc);
        return this._iterateBatches(query, task, i);
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
    let taskReturn = task(doc, index);
    let isPromise = taskReturn instanceof Promise;
    if(!isPromise){
      try {
        for(let doc of docs){
          index++;
          task(doc, index);
        }
        return Promise.resolve(index);
      }catch(e){
        return Promise.reject(e);
      }
    }
    return taskReturn.then(()=> {
      if(docs && docs.length > 0){
        index++;
        return _iterateDocs(docs, task, index);
      }else {
        return Promise.resolve(index);
      }
    });
  }

  /**
  * A map of potential collection errors.
  * @override
  * @return {Object} map of error objects
  */
  static get errors(){
    return {
      badPath: new Error("Make sure collection paths have odd depth and are of the standard path format."),
    };
  };
}

module.exports = collection;
