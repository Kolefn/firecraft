const admin = require('../admin');
const database = admin.firestore;
/**
* Operations related to  firestore reference objects.
*/
class reference {
  /**
  * Interprets a path object into a firestore reference object.
  *@param {path} representing document/collection path
  *@return {object} [See API]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  static parse(path){
    if(path.toString().indexOf('{') > -1){ throw reference.errors.parameterInPath }
    let segments = path.getSegments();
    let docId;
    if(segments.length % 2 == 0){ docId = segments.pop(); }
    let ref = database.collection(segments.join("/"));
    if(docId){ ref = ref.doc(docId); }
    return ref;
  }

  /**
  * Reference related errors object
  * @return {object} errors
  */
  static get errors(){
    return {
      parameterInPath: new Error("A reference cannot contain a path parameter.")
    }
  }
}


module.exports = reference;
