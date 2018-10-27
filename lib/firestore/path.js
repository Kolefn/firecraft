/**
  High level representation of a firebase resource path.
*/
class path {

  constructor(string){
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
    if(typeof args !== 'object'){ return new path(this._string); }
    let newPath = "";
    let param = "";
    let reading = false;
    for(let c of this._string){
      if(c == '{'){ param = ""; reading = true; }
      else if(c == '}'){
        let arg = args[param];
        if(arg == null || arg == undefined || arg == NaN){
          arg = args[nameMap[param]];
          if(arg == null || arg == undefined || arg == NaN){
            throw path.errors.insertNilArg;
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

    return new path(newPath);
  }

  static get errors() {
    insertNilArg: "Failed attempt to insert nil argument in place of path parameter."
  };

}

module.exports = path;
