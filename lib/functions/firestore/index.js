module.exports.collection = require('./collection');
module.exports.createDocuments = (paths) => {
  let documents = {};
  for(let name in paths){
    let path = paths[name];
    documents[name] = new module.exports.collection.document(path);
  }
  return documents;
};
