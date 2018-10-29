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
