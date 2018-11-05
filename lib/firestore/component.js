/**
* Represents a core piece of the library that can be extended by the user using nodes.
* @class
*/
class component {
  /**
  * Defines a new function to be called on this class.
  * @param {string} name what this node shall be called.
  * @param {function} func what this node will do.
  * Things to note when using the new node:
  * The calling instance will be automatically inserted as the first argument.
  * The calling instance will be returned by default if the provided function does not return anything.
  * @example
  * extend('add', (doc, number) => doc.transaction((t, doc)=> t.update(doc.ref, doc.data().value + number)));
  * @static
  */
  static extend(name, func){
    this.prototype[name] = function(...args){
      let providedFunctionReturn = func(this, ...args);
      if(providedFunctionReturn == undefined){
        return this;
      }else{
        return providedFunctionReturn;
      }
    }
  }

}


module.exports = component;
