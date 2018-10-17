const instance = require('./instance');
const document = require('./document');

class collection {

  node(){

  }

  get instance(){
    return instance;
  }

  static get document(){
    return document;
  }
}

module.exports = collection;
