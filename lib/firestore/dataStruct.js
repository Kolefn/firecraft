const { injectPathArgs } = require('./util');
class dataStruct {


  constructor(path){
    this._path = path;
    this._pathSegments = path.split("/");
    if(!this.constructor.isValidPath(this._pathSegments)){ throw this.constructor.errors.badPath  }
  }

  /**
  * A safe reference to this dataStruct path.
  */
  get path(){
    return this._path;
  }

  /**
  * A safe reference to this dataStruct path segments
  */
  get pathSegments(){
    return this._pathSegments;
  }

  /**
  * Get the parent dataStruct to this dataStruct. Creates it if needed.
  * @return {dataStruct}
  */
  get parent(){
    if(this._parent){
      return this._parent;
    }else{
      let parentPath = this._pathSegments.slice(0, this._pathSegments.length-1).join("/");
      return new this.constructor.childClass(parentPath);
    }
  }

  /**
  * This segments firestore reference object. Creates one if has not yet been generated.
  */
  get reference(){
    if(this._reference){
      return this._reference;
    }else {
      if(this.path.indexOf('{') > -1){ throw this.constructor.errors.badReferencePath }
      return this._toReference();
    }
  }

  /**
  * Create a new dataStruct by extending this path with the input path.
  * @param {string} path relative to this dataStruct.
  * @return {dataStruct}
  */
  extend(path){
    if(typeof path !== 'string'){ throw this.constructor.errors.badPath;}
    if(this.constructor.isValidPath(path.split("/"))){
      return new this.constructor(this.path + "/" + path);
    }else {
      return new this.constructor.childClass(this.path + "/" + path);
    }
  }


  /**
  * Creates a copy of this dataStruct with the option to
  * fullfil path parameters with provided data & map.
  * @param {object} data from which arguments for path parameters will be extracted.
  * @param {object} map path parameter names to relevant data property names.
  * @return {dataStruct}
  * @example
  * new document('users/{userId}').instance({uid: 'zach123'}, {userId: 'uid'});
  */
  instance(data, map){
    let path = this.path;
    if(typeof data == 'object'){
      path = injectPathArgs(this.path, data, map);
    }
    return new this.constructor(path);
  }

  /**
  * Defines a new function to be called on this class.
  * @param {string} name what this node shall be called.
  * @param {function} func what this node will do.
  * The calling instance will be automatically inserted as the first argument.
  * @example
  * node('child', (doc, childName) => new firestore.collection(doc.path + "/" + childName));
  * @static
  */
  static node(name, func){
    this.prototype[name] = function(...args){
      return func(this, ...args);
    }
  }

  /**
  * Determines if the provided path is a valid path.
  * @param {Array} pathSegments of the dataStruct
  * @return {bool} if the path is valid.
  */
  static isValidPath(pathSegments){
    return Array.isArray(pathSegments);
  }

  /**
  * A map of potential document errors.
  */
  static get errors(){
    return {
      badPath: new Error("Make sure provided paths follow the standard format."),
      badReferencePath: new Error("A reference cannot contain a path parameter.")
    }
  };


}


module.exports = dataStruct;
