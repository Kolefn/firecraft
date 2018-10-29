const admin = require('../admin');
const path = require('./path');
const database = admin.firestore;
/**
* Operations related to  firestore reference objects.
*/
class reference {
  /**
  * Interprets a path object into a firestore reference object.
  *@param {path} pathObj representing document/collection path
  *@return {reference} [See API]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  static parse(pathObj){
    if(pathObj.toString().indexOf('{') > -1){ throw reference.errors.parameterInPath }
    let segments = pathObj.getSegments();
    let docId;
    if(segments.length % 2 == 0){ docId = segments.pop(); }
    let ref = database.collection(segments.join("/"));
    if(docId){ ref = ref.doc(docId); }
    return ref;
  }

  /**
  * Creates a new path object representation of the passed firestore reference.
  * @param {reference} ref can be a DocumentReference or CollectionReference.
  * @return {path}
  */
  static getPath(ref){
    try {
      let className = ref.constructor.name;
      let goodRef = className == 'DocumentReference' || className == 'CollectionReference';
      if(!goodRef){ throw null }
    }catch(e){
      throw reference.errors.wrongReferenceClass
    }

    let segments = [ref.id];
    try {
      while(ref.parent != null){
        let id = ref.parent.id;
        if(id.length > 0){
          segments.push(id);
        }
        ref = ref.parent;
      }
    }
    catch(e){
      //eventually CollectionReference will throw a property-access error. ignore it here.
    }
    return new path(segments.reverse().join("/"));
  }

  /**
  * Reference related errors object
  * @return {object} errors
  */
  static get errors(){
    return {
      wrongReferenceClass: new Error("Can only getPath of DocumentReference or CollectionReference objects."),
      parameterInPath: new Error("A reference cannot contain a path parameter.")
    }
  }
}


module.exports = reference;
