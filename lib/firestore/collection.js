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
