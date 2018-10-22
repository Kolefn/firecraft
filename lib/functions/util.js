/**
* Defines a new function to be called on functions.util.
* @param {string} name what this node shall be called.
* @param {function} func what this node will do.
* @example
* node('add', (num1, num2) => num1+num2);
* @static
*/
module.exports.node = (name, func) => {
  module.exports[name] = function(...args){
    return func(this, ...args);
  }
}
