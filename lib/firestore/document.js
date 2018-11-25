const {extractData, computeTransactionUpdateObject } = require('./util');
const admin = require('../admin');
const database = admin.firestore;
const path = require('./path');
const reference = require('./reference');
const component = require('./component');
class document extends component  {
  /**
  * This class is a high level representation of a firestore document.
  * Path parameters wrapped in curly brackets are supported.
  * @class document
  * @param {string/path} pathInput is a path wich may include parameters. Can be type string or path object.
  * @example
  * new document("users/{userId}/characters/{characterId}");
  */
  constructor(pathInput){
    super();
    if(typeof pathInput == 'string'){ this._path = new path(pathInput); }
    else if(pathInput){ this._path = pathInput; }
    if(this._path.isEven === false){ throw document.errors.badPath }
    this._onCreateHandlers = [];
    this._onDeleteHandlers = [];
    this._onUpdateHandlers = [];
    this._onWriteHandlers = [];
  }
  /**
  * Get this document's ID string
  * @return {string} id
  */
  get id(){
    return this._path.end;
  }
  /**
  * Gets the firestore reference object for this document
  * @return {DocumentReference} [See API]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  get reference(){
    if(this._reference){
      return this._reference;
    }else {
      this._reference = reference.parse(this._path);
      return this._reference;
    }
  }
  /**
  * Registers a function to fire when a document matching this path is created.
  * @param {function} handler that will be called on create.
  * @return {document} this document
  * @example
  * doc.onCreate((snapshot)=> docToCreate.instance(snapshot.data()).set(snapshot.data()));
  */
  onCreate(handler){
    if(handler == null || handler == undefined || typeof handler != 'function'){
      throw document.errors.badTriggerInput
    }

    this._onCreateHandlers.push(handler);

    return this;
  }
  /**
  * Registers a function to fire when a document matching this path is deleted.
  * @param {function} handler that will be called on delete.
  * @return {document} this document
  * @example
  * doc.onDelete((snapshot)=> docToDelete.instance(snapshot.data()).delete());
  */
  onDelete(handler){
    if(handler == null || handler == undefined || typeof handler != 'function'){
      throw document.errors.badTriggerInput
    }

    this._onDeleteHandlers.push(handler);

    return this;
  }
  /**
  * Registers a function to fire when a document matching this path is updated.
  * @param {function} handler that will be called on update.
  * @return {document} this document
  * @example
  * doc.onUpdate((change, context)=> docToUpdate.instance(change.after.data()).update({lastUpdated: context.timestamp}));
  */
  onUpdate(handler){
    if(handler == null || handler == undefined || typeof handler != 'function'){
      throw document.errors.badTriggerInput
    }

    this._onUpdateHandlers.push(handler);

    return this;
  }
  /**
  * Registers a function to fire when a document matching this path is created/deleted/updated.
  * @param {function} handler that will be called on write. The handler is passed [Change]{@link https://firebase.google.com/docs/reference/functions/functions.Change}
  * with a recentData prop added containing the latest existing data after the event. The handler is passed [Context]{@link https://firebase.google.com/docs/reference/functions/functions.EventContext}
  * with a writeType string prop ("create"/"delete"/"update"). A bool prop is set to true (createType/deleteType/updateType) for the write type to support different logic styles.
  * @return {document} this document
  */
  onWrite(handler){
    if(handler == null || handler == undefined || typeof handler != 'function'){
      throw document.errors.badTriggerInput
    }
    let argumentWrapper = (change, context) => {
      if(!change.before.exists){
        context.writeType = "create";
        context.createType = true;
        change.recentData = change.after.data();
      }else if(!change.after.exists){
        context.writeType = "delete";
        context.deleteType = true;
        change.recentData = change.before.data();
      }else {
        context.writeType = "update";
        context.updateType = true;
        change.recentData = change.after.data();
      }
      return handler(change, context);
    };
    this._onWriteHandlers.push(argumentWrapper);

    return this;
  }
  /**
  * Writes data to this document in the database.
  * @param {Object} data to be written.
  * @param {Object} options to customize how data is written. [See API]{@link https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/SetOptions}
  * for options supported by Firestore. Pass options with batch: aWriteBatchObject to add this write operation to a Firestore WriteBatch instead.
  * @return {Promise} resolves with void once data is succesfully written.
  */
  set(data, options={}){
    if(options.batch){
      return options.batch.set(this.reference, data, options);
    }
    return this.reference.set(data, options);
  }
  /**
  * Updates data of this document in the database
  * @param {Object} data to be updated
  * @param {Object} options to customize how data is updated. Pass options with {batch} to add this write operation to a Firestore WriteBatch instead.
  * @return {Promise} resolves once data is successfully updated.
  */
  update(data, options={}){
    if(options.batch){
      return options.batch.update(this.reference, data, options);
    }
    return this.reference.update(data);
  }
  /**
  * Delete this document data from database
  * @param {Object} options to customize how data is deleted. Pass options with {batch} to add this delete operation to a Firestore WriteBatch instead.
  * @return {Promise} resolves once data is successfully deleted.
  */
  delete(options={}){
    if(options.batch){
      return options.batch.delete(this.reference);
    }else{
      return this.reference.delete();
    }
  }
  /**
  * Retrieves existing data at this path in database.
  * @return {Promise} resolves with [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  */
  get(){
    return this.reference.get();
  }
  /**
  * Simpler Firestore transaction. Allows you to make state dependent writes
  * such as increment counters.
  * @param {Function} func called with a [Transaction]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.Transaction}, [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentSnapshot}
  * , and [DocumentReference]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  * @return {Promise} resolves when transaction completes
  * @example
  * new document('users/alexa').transaction((t, doc, ref)=> t.update(ref, {count: doc.data().count + 1}));
  */
  transaction(func){
    let ref = this.reference;
    return database.runTransaction((transaction) => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(ref).then((doc)=> {
          return func(transaction, doc, ref);
        });
    });
  }
  /**
   * Add a value (default=1) to a document field. If the field or document does not exist,
   * it will be initialized with the passed or default value.
   * @param  {string} fieldName on the document
   * @param  {number} val      to be added to the field data. default of 1.
   * @return {promise}         resolves when the transaction is successful
   */
  incrementField(fieldName, val=1){
    let data = {};
    data[fieldName] = val;
    return this.incrementFields(data);
  }
  /**
   * Add values to document fields. If the field or document does not exist,
   * it will be initialized with the passed value.
   * @param  {object} fieldNameDeltaPairs mapping the field name to the value that should be added
   * to that field on the document.
   * @return {promise} resolves when the transaction is successful.
   */
  incrementFields(fieldNameDeltaPairs){
    return this.transaction((t, doc, ref)=> {
      if(doc.exists){
        let data = doc.data();
        let update = computeTransactionUpdateObject(fieldNameDeltaPairs, data);
        t.update(ref, update);
      }else{
        t.set(ref, fieldNameDeltaPairs);
      }
    });
  }
  /**
  * Creates a copy of this document with the option to
  * fullfil path parameters with provided data & map.
  * @param {Object} data [Change]{@link https://firebase.google.com/docs/reference/functions/functions.Change} or [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/functions/functions.firestore.DocumentSnapshot} or plain Object from which arguments for path parameters will be extracted.
  * @param {Object} map path parameter names to relevant data property names.
  * @return {document}
  * @example
  * new document('users/{userId}').instance({uid: 'zach123'}, {userId: 'uid'});
  */
  instance(data, map){
    let argData = extractData(data);
    return new document(this._path.insertArgs(argData, map));
  }

  /**
   * Init a document representing a document in a sub collection of this document.
   * @param  {type} relativePath from this document to child
   * @return {document}
   */
  child(relativePath){
    return new document(this._path.toString() + relativePath);
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
  createOnCreate(docToCreate, mapping){
    if(this.path.equalTo(docToCreate)){ throw "Cannot pass the same document to createOnCreate." }
    this.onCreate((snapshot, context)=> docToCreate.instance({snapshot, context}, mapping).set(snapshot.data()));
  };
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
  deleteOnDelete(docToDelete, mapping){
    if(this.path.equalTo(docToDelete)){ throw "Cannot pass the same document to deleteOnDelete." }
    this.onDelete((snapshot, context)=> docToDelete.instance({snapshot, context}, mapping).delete());
  };
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
  couple(docToCoupleWith, mapping){
    if(this.path.equalTo(docToCoupleWith)){ throw "Document cannot be coupled with itself." }
    //@TODO test for same collections but different id
    this.createOnCreate(docToCoupleWith, mapping);
    this.deleteOnDelete(docToCoupleWith, mapping);
    docToCoupleWith.createOnCreate(this, invert(mapping));
    docToCoupleWith.deleteOnDelete(this, invert(mapping));
  };
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
  addDocumentCountFields(documentsToCount, mapping){
    for(let i in documentsToCount){
      let doc = documentsToCount[i];
      doc.onCreate((snapshot, context)=> this.instance({snapshot, context}, mapping).incrementField(snapshot.ref.parent.id, 1));
      doc.onDelete((snapshot, context)=> this.instance({snapshot, context}, mapping).incrementField(snapshot.ref.parent.id, -1));
    }
  };
  /**
   * Setup counter fields on this document that track document data. Use addDocumentCountFields
   * to setup counters that track the existence of documents.
   * @param {function} event such as document.onCreate, document.onUpdate
   * @param {function} calculation is passed the event arguments and must return an object
   * representing {fieldName: deltaValue} pairs that will be used to update or initialize data count
   * fields on the document.
   * @param {object} mapping dictating how path wildcards should be replaced with data.
   * @example
   * let user = new document('user/{userId}');
   * let userMatch = new document('user/{userId}/matches/{matchId}');
   * user.addDataCountFields(userMatch.onWrite, (change, context)=> {
        let before = change.before.data();
        let after = change.after.data();
        let score0 = before ? before.score : 0;
        let score1 = after ? after.score : 0;
        let delta = score1 - score0;
        return {points: delta};
    });
   */
  addDataCountFields(event, calculation, mapping){
    event((eventData, context)=> this.instance({eventData, context}, mapping).incrementFields(calculation(data)))));
  };
  /**
   * Setup distributed counter fields on this document that track document data.
   * Distributed means that the data is recorded across multiple sub documents
   * known as shards. Read more about Firestore distributed counters [here]{@link https://firebase.google.com/docs/firestore/solutions/counters}
   * Full counts are also stored on this document just like with addDataCountFields to make queries
   * on this data possible. However, remember that the full counts stored on this document may not
   * be as accurate as the sum of shard data.
   * @param {function} event such as onWrite, onCreate, onUpdate, onDelete
   * @param {function} is passed the event arguments and must return an object
   * representing {fieldName: deltaValue} pairs that will be used to update or initialize data count
   * fields on the document.
   * @param {number} shards the number of documents for count data to be distributed across. (default=3)
   * @param {object} mapping dictating how path wildcards should be replaced with data.
   * @example
   * let user = new document('user/{userId}');
   * let userMatch = new document('user/{userId}/matches/{matchId}');
   * user.addDistributedCountFields(userMatch.onWrite, (change, context)=> {
        let before = change.before.data();
        let after = change.after.data();
        let score0 = before ? before.score : 0;
        let score1 = after ? after.score : 0;
        let delta = score1 - score0;
        return {points: delta};
    });
   */
  addDistributedCountFields(event, calculation, shards=3, mapping)=> {
    let child = this.child('shards/{shardId}');
    event((eventData, context)=> {
      let shardId = Math.floor(Math.random()*shards);
      context.params.shardId = shardId;
      child.instance({eventData, context}, mapping).incrementFields(calculation(eventData));
    });
    child.onCreate((snapshot, context)=> this.instance({snapshot, context}, mapping).incrementFields(snapshot.data()));
    child.onUpdate((change, context)=> this.instance({snapshot, context}, mapping)
         .incrementFields(computeTransactionUpdateObject(change.after.data(), change.before.data(), {subtract: true})));
  };
  /**
  * Creates a document from a firestore DocumentReference object
  * @param {DocumentReference} ref [See API] {@link https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference}
  * @return {document}
  */
  static fromReference(ref){
    if(ref.constructor.name !== 'DocumentReference'){ throw document.errors.badReferenceClass }
    let doc = new document(reference.getPath(ref));
    doc._reference = ref;
    return doc;
  }
  /**
  * A map of potential document errors.
  * @override
  * @return {Object} map of error objects
  */
  static get errors(){
    return {
      badReferenceClass: new Error("Can only use fromReference to create documents from a DocumentReference object."),
      badPath: new Error("Make sure provided document paths have even depth and are of the standard path format."),
      badTriggerInput: new Error("Document trigger functions (e.g. onCreate, onWrite) only accept non-null handlers."),
    };
  };
}


module.exports = document;
