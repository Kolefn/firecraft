
/**
* Parses a path string and returns a 'true' value map of the parameters encapsulated by {}.
* @param {string} string is the path string
* @return {object} a 'true' value map of parameter names.
*/
module.exports.extractPathParams = (string="") => {
  let params = {};
  let param = "";
  let reading = false;
  for(let c of string){
    if(c == '{'){ param = ""; reading = true; }
    else if(c == '}'){ params[param] = true; reading = false; }
    else if(c == '/'){ continue; }
    else if(reading) { param += c; }
  }

  return params;
}


/**
* Checks if the path has an (even or odd) number of parts and has proper syntax.
* @param {string} path the document path to be verified.
* @param {bool} even if the path should have an even number of parts.
* @return {bool} true if the document path is valid.
*/
module.exports.isValidPath = (path, even=true) => {
  try {
    let parts = path.split("/");
    if((parts.length % 2 != 0) == even){ throw "wrong number of parts"}
    return true;
  }catch(e){
    return false;
  }
}

const errors = {
  injectNilArg: new Error("Cannot inject null or undefined argument for path parameter."),
};


/**
* Defines a new function to be called on firestore.util.
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


module.exports.errors = errors;
