const component = require('./component');
class query extends component {

  /**
  * A high level representation of a firestore query. Normally a query is constructed
  * using a firstore reference object. This class wraps that functionality for
  * more structure, functionality, extendability, and sugarization.
  * @param {CollectionReference} reference to a collection
  * @param {Object} options containing any query parameters to initialize this query with.
  */
  constructor(reference, options={}){
    super();
    this._ref = reference;
    //initialize query
    for(let key in options){
      let val = options[key];
      if(typeof val == 'string' || typeof val == 'number'){
        this._ref = this._ref[key](val);
      }else if(Array.isArray(val)){
        if(val.length % 3 == 0){
          for(let i = 0; i < val.length; i+=3){
            this._ref = this._ref[key](val[i], val[i+1], val[i+2]);
          }
        }else{
          this._ref = this._ref[key](...val);
        }
      }else {
        this._ref = this._ref[key](val);
      }
    }
    this._limit = options.limit;
    this._orderBy = options.orderBy;
  }

  /**
  * Execute the query.
  * @return {Promise} resolves with a [QuerySnapshot]{@link https://firebase.google.com/docs/reference/js/firebase.firestore.QuerySnapshot}
  * containing all documents which match the query.
  */
  get(){
    return this._ref.get();
  }

  /**
  * Use to access properties and functions of the raw firestore query objects
  * that this class is abstracting.
  * @return {FirestoreQuery} [See API]{@link https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/Query}
  */
  get access(){
    return this._ref;
  }

  /**
  * Read only access to the limit set on this query.
  * @return {Number} limit
  */
  get limit(){
    return this._limit;
  }

  /**
  * Set the query cursor to after the provided document. If an order field
  * has been set via 'orderBy' then that data will be automatically extracted.
  * @param {DocumentSnapshot} doc
  */
  startAfter(doc){
    if(this._orderBy){
      let data = doc.data();
      let cursor = data[this._orderBy[0]];
      this._ref = this._ref.startAfter(cursor);
    }else{
      this._ref = this._ref.startAfter(doc);
    }
  }
}

module.exports = query;
