const instance = require('./instance');

class document {

  /**
  * This class is a high level representation of a firestore document.
  * Specifically, it represents a generic reference to a document before
  * arguments are provided for the document ID parameters in the path.
  * @class document
  * @param {string} path is a generic path wich may include document ID parameters.
  * @example
  * new document("users/{userId}/characters/{characterId}");
  */
  constructor(path){
    this.path = path;
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
    collection.prototype[name] = function(...args){
      return func(this, ...args);
    }
  }

  /**
  * Getter for the static members of document instance.
  * @return {instance} document.instance module
  * @static
  */
  static get instance(){
    return instance;
  }
}


module.exports = document;
