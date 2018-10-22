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
    this.path = path;
    this.params = extractPathParams(path);
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
    }
  };
}


module.exports = document;
