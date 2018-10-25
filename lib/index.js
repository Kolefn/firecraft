module.exports.firestore = require('./firestore');
module.exports.admin = require('./admin');
/**
* Get all cloud functions that will be deployed.
* @return {Object} cloud functions
*/
module.exports.export = () => {
  return module.exports.firestore.export();
}
