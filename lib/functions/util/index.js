
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
* Creates a new path with the encapsulated parameters replaced with arguments.
* @param {string} path is the path with potential parameters
* @param {object} args is a map of values to replace parameters with.
* @param {object} nameMap is an optional reference map for when arg keys do not match relevant param name.
* @return {string} a new path with data in place of parameters.
* @example
* util.injectPathArgs('col/{docId}/list/{itemId}',
  {userId: 'zach123', achievementId: 'highscore'},
  {docId: 'userId', itemId: 'achievementId'});
*/
module.exports.injectPathArgs = (path="", args={}, nameMap={}) => {
  let newPath = "";
  let param = "";
  let reading = false;
  for(let c of path){
    if(c == '{'){ param = ""; reading = true; }
    else if(c == '}'){
      let arg = args[param];
      if(arg == null || arg == undefined || arg == NaN){
        arg = nameMap[param];
        if(arg == null || arg == undefined || arg == NaN){
          throw errors.injectNilArg;
        }
      }
      newPath += arg;
      reading = false;
    }
    else if(reading) { param += c; }
    else {
      newPath += c;
    }
  }

  return newPath;
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

module.exports.errors = errors;
