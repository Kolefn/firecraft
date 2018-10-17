const instance = require('./instance');

class document {

  constructor(path){
    this.path = path;
  }

  node(){

  }

  static get instance(){
    return instance;
  }
}


module.exports = document;
