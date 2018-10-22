/**
* This module wraps the firebase-functions module primarly for development/testing purposes.
* It may also provide light utility & sugarization.
* @module firebase-functions-wrapper
*/
module.exports.firestore = {

};

module.exports.firestore.document = () => {
  return {
    onCreate: ()=> {},
  }
};
