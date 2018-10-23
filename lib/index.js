/**
* This is the root module containing references to all function related sub-modules.
* @module functions
*/
module.exports.firestore = require('./firestore');
module.exports.util = require('./util');


/**
* Get all functions that will be deployed to firebase.
* @return {Object} cloud functions
*/
module.exports.export = () => {
  return module.exports.firestore.export();
}
