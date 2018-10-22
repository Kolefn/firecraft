const { isValidPath } = require('../../util');
class documentInstance {

  constructor(path){
    if(path.indexOf('{') > -1){ throw documentInstance.errors.paramInPath }
    if(!isValidPath(path)){ throw documentInstance.errors.badPath }
    this.path = path;

  }

  static get errors(){
    return {
      paramInPath: new Error("Document instance paths cannot have parameters (e.g. {userId}, {itemId})."),
      badPath: new Error("Document instance paths must have an even number of parts and follow standard format."),
    }
  }
}

module.exports = documentInstance;
