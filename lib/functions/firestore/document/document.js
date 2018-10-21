const instance = require('./instance');
const { extractPathParams } = require('../../util');

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
    if(!document.isValidPath(path)){ throw document.errors.badPath  }
    this.path = path;
    this.params = extractPathParams(path);
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
  * Getter for the static members of document instance.
  * @return {instance} document.instance module
  * @static
  */
  static get instance(){
    return instance;
  }
  /**
  * Checks if the path has an even number of layers and has proper syntax.
  * @param {string} path the document path to be verified.
  * @return {bool} true if the document path is valid.
  */
  static isValidPath(path){
    try {
      let layers = path.split("/");
      if(layers.length % 2 != 0){ throw "odd number of layers"}

      return true;
    }catch(e){
      return false;
    }
  }

  /**
  * A map of potential document errors.
  */
  static get errors(){
    return {
      badPath: new Error("Make sure provided document paths have even depth and are of the standard path format."),
    }
  };
}


module.exports = document;
