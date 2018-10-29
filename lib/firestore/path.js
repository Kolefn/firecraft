const component = require('./component');
/**
  High level representation of a firebase resource path.
*/
class path extends component {

  constructor(string){
    super();
    this._string = string;
    this._segments = string.split("/");
  }

  /**
  * Does this path contain an even number of segments?
  * @return {bool}
  */
  get isEven(){
    return this._segments.length % 2 == 0;
  }


  /**
  * get the last segment
  * @return {string}
  */
  get last(){
    return this._segments[this._segments.length-1];
  }

  /**
  * returns a copy of the internal segments array.
  * @return {Array} of segments
  */
  getSegments(){
    return this._segments.slice();
  }


  /**
  * Creates a new path object with new segments appended.
  * @param {string} extension relative path string to this path
  * @return {path} extended path
  */
  child(extension){
    return new path(this._string + "/" + extension);
  }

  /**
  * Creates a new path with n number of segments removed from the end.
  * @param {number} steps
  * @return {path}
  */
  parent(steps=1){
    let segments = this._segments.slice(0, this._segments.length-steps);
    return new path(segments.join("/"));
  }


  /**
  * @return {string} representation of this path
  */

  toString(){
    return this._string;
  }

  /**
  * Creates a new path with this path's parameters replaced with arguments.
  * @param {object} args is a map of values to replace parameters with.
  * @param {object} nameMap is an optional reference map for when arg keys do not match relevant param name.
  * @return {path} a new path with data in place of parameters.
  * @example
  * new path('col/{docId}/list/{itemId}').insertArgs({userId: 'zach123', achievementId: 'highscore'}, {docId: 'userId', itemId: 'achievementId'});
  */
  insertArgs(args, nameMap={}){
    if(args === null || args === undefined){ return new path(this._string); }
    let replaceBracketRegEx = /{([^{]+)}/g;
    let newPath = this._string.replace(replaceBracketRegEx, function(ignore, key){
             let arg = args[key];
             if(arg === null || arg === undefined || Number.isNaN(arg)){
                 arg = args[nameMap[key]];
                 if(arg === null || arg === undefined || Number.isNaN(arg)){ throw path.errors.insertNilArg }
                 return arg;
             }else {
                 return arg;
             }
    });

    return new path(newPath);
  }

  static get errors() {
    return {
      insertNilArg: "Failed attempt to insert null/undefined/NaN argument in place of path parameter."
    }
  };

}

module.exports = path;
