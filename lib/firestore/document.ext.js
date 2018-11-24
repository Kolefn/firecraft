var document = null;
//const { invert } = require('./lodash');

/**
* Set the document class to be extended. May not be needed.
*/
module.exports.extend = (documentImport) => {
  document = documentImport;
}
/**
* Create a document whenever this document is created.
* @param {document) docToCreate when this document is created
* @param {Object} mapping dictating how wildcards within document path should be replaced
* @example
* let sent = new document("user/{userId}/sentInvites/{inviteId}");
* let received = new document("user/{userId}/receivedInvites/{inviteId}");
* sent.createOnCreate(received, {userId: 'inviteId', inviteId: 'userId'});
*/
document.extend("createOnCreate", (doc, docToCreate, mapping)=> {
  if(doc.path.equalTo(docToCreate)){ throw "Cannot pass the same document to createOnCreate." }
  doc.onCreate((snapshot, context)=> docToCreate.instance({snapshot, context}, mapping).set(snapshot.data()));
});
/**
* Delete a document whenever this document is deleted.
* @param {document) docToDelete when this document is delete
* @param {Object} mapping dictating how wildcards within document path should be replaced
* @example
* let contentCreatedByUser = new document("users/{userId}/groups/{groupId}/content/{contentId}");
* let contentVisibleToGroup = new document("groups/{groupId}/content/{contentId}");
* //the mapping argument is optional here because the wildcards can be intuitively replaced
* contentCreatedByUser.deleteOnDelete(contentVisibleToGroup);
*/
document.extend("deleteOnDelete", (doc, docToDelete, mapping)=> {
  if(doc.path.equalTo(docToDelete)){ throw "Cannot pass the same document to deleteOnDelete." }
  doc.onDelete((snapshot, context)=> docToDelete.instance({snapshot, context}, mapping).delete());
});
/**
* This extension defines a two way dependence relationship
* between documents. Ensures each document is created when
* the other is created, and each document is deleted when
* the other is deleted.
* @param {document} docToCoupleWith will be created/delete when this documented
* is created or deleted, and visa versa.
* @param {mapping} mapping dictating how wildcards within document path should be replaced
* @example
* let userVote = new document("users/{userId}/votes/{contentId}");
* let contentVote = new document("content/{contentId}/votes/{userId}");
* userVote.couple(contentVote);
*/
document.extend("couple", (doc, docToCoupleWith, mapping)=> {
  if(doc.path.equalTo(docToCoupleWith)){ throw "Document cannot be coupled with itself." }
  //@TODO test for same collections but different id
  doc.createOnCreate(docToCoupleWith, mapping);
  doc.deleteOnDelete(docToCoupleWith, mapping);
  docToCoupleWith.createOnCreate(doc, invert(mapping));
  docToCoupleWith.deleteOnDelete(doc, invert(mapping));
});

/**
 * Setup fields on this document that automatically keep count of sub documents.
 * The fields are named after the containing collections that the sub documents are in.
 * 1 is added to the field when a document is created, and -1 is added to the field when
 * a document is deleted.
 * @param {Array} documentsToCount an array of document objects to be tracked.
 * @param {Object} mapping to dictate how wildcards should be replaced with data.
 * @example
 * let group = new document('groups/{groupId}');
 * let groupUser = new document('groups/{groupId}/users/{userId}');
 * let groupMessage = new document('groups/{groupId}/messages/{messageId}');
 * group.count([groupUser, groupMessage]);
 */
document.extend("addDocumentCountFields", (doc, documentsToCount, mapping)=> {
  for(let i in documentsToCount){
    let doc = documentsToCount[i];
    doc.onCreate((snapshot, context)=> root.instance({snapshot, context}, mapping).incrementField(snapshot.ref.parent.id, 1));
    doc.onDelete((snapshot, context)=> root.instance({snapshot, context}, mapping).incrementField(snapshot.ref.parent.id, -1));
  }
});


/**
 * Setup counter fields on this document that track document data. Use addDocumentCountFields
 * to setup counters that track the existence of documents.
 * @param {function} event such as document.onCreate, document.onUpdate
 * @param {function} calculation is passed the event arguments and must return an object
 * representing {fieldName: deltaValue} pairs that will be used to update or initialize data count
 * fields on the document.
 * @example
 * let user = new document('user/{userId}');
 * let userMatch = new document('user/{userId}/matches/{matchId}');
 * user.addDataCountFields(userMatch.onWrite, (change, context, delta)=> {
      let before = change.before.data();
      let after = change.after.data();
      let score0 = before ? before.score : 0;
      let score1 = after ? after.score : 0;
      let delta = score1 - score0;
      return {points: delta};
  });
 */
document.node('addDataCountFields', (doc, event, calculation, mapping)=> {
  event((data, context)=> doc.instance({data, context}, mapping).incrementFields(calculation(data)))));
});
