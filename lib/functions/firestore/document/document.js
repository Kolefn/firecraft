const instance = require('./documentInstance');
const { extractPathParams, injectPathArgs, isValidPath } = require('../../util');

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
    if(!isValidPath(path)){ throw document.errors.badPath  }
    this.path = path;
    this.params = extractPathParams(path);
  }

  /**
  * Creates a new document instance by fullfilling this parameters
  * with the provided data/mapping.
  * @param {object} data from which path parameter arguments will be extracted.
  * @param {object} map path parameter names to relevant data property names.
  * @return documentInstance
  * @example
  * new document('users/{userId}').instance({uid: 'zach123'}, {userId: 'uid'});
  */
  instance(data, map){
    return new instance(injectPathArgs(this.path, data, map));
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
  * A map of potential document errors.
  */
  static get errors(){
    return {
      badPath: new Error("Make sure provided document paths have even depth and are of the standard path format."),
    }
  };
}


module.exports = document;
