const admin = require('../admin');
const path = require('./path');
const database = admin.firestore;
class collection {

  /**
  * This class is a high level representation of a firestore collection.
  * Path parameters wrapped in curly brackets are supported.
  * @class collection
  * @param {string/path} pathInput is a path string wich may include parameters. Can be either a string or path object.
  * @example
  * new collection("users/{userId}/characters/{characterId}/achievements");
  */
  constructor(pathInput){
    if(typeof pathInput == 'string'){ this._path = new path(pathInput); }
    else if(pathInput){ this._path = pathInput; }
  }

  /**
  * Builds a firestore reference object from this collection's path.
  * @override
  * @return {CollectionReference} [See API]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.CollectionReference}
  */
  _toReference(){
    return database.collection(this._pathSegments.join("/"));
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

  /**
  * Determines if the provided path is a valid collection path.
  * @override
  * @param {Array} pathSegments of the collection
  * @return {bool} if the path is valid.
  */
  static isValidPath(pathSegments){
    super.isValidPath(pathSegments);
    return pathSegments.length % 2 > 0;
  }

  /**
  * Determines if the provided path (relative to a collection) is a valid collection path.
  * @override
  * @param {Array} pathSegments of the relative collection path.
  * @return {bool} if the relative path is valid.
  */
  static isRelativePathValid(pathSegments){
    return !collection.isValidPath(pathSegments);
  }


}

module.exports = collection;
