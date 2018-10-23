const document = require('./document');


class collection {

  /**
  * This class is a high level representation of a firestore collection.
  * Path parameters wrapped in curly brackets are supported.
  * @class collection
  * @param {string} path is a path wich may include parameters.
  * @example
  * new collection("users/{userId}/characters/{characterId}/achievements");
  */
  constructor(path){
    this.path = path;
  }

  /**
  * Defines a new function to be called on this class.
  * @param {string} name what this node shall be called.
  * @param {function} func what this node will do.
  * The collection object will be automatically inserted as the first argument.
  * @example
  * node('child', (col, childName) => col.document(col.path + '/' + childName));
  * @static
  */
  static node(name, func){
    collection.prototype[name] = function(...args){
      return func(this, ...args);
    }
  }

  /**
  * Getter for the static members of collection document.
  * @return {document} collection.document module
  * @static
  */
  static get document(){
    return document;
  }
}

module.exports = collection;
