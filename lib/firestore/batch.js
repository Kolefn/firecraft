const admin = require('../admin');
const database = admin.firestore;
const component = require('./component');
/**
* A high level representation of a firestore batch object.
* Provides several sugarizations and utilties ontop.
* Is extendable through .node() function similar to document/collection objects.
*/
class batch extends component {

  static get MAX_WRITES() { return 500 }

  /**
  * Creates an internal firebase batch and initiates a writes counter.
  * @param {object} options {commitWhenFull: true}
  */
  constructor(options){
    super();
    this._options = {commitWhenFull: true};
    Object.assign(this._options, options);
    this._batch = database.batch();
    this._writes = 0;
  }

  /**
  * Get the current write count.
  * @return {number}
  */
  get writes(){
    return this._writes;
  }

  /**
  * Has this batch been written to a maximum number of times without commit.
  * @return {bool}
  */
  get full(){
    return this._writes >= batch.MAX_WRITES;
  }

  /**
  * Have any writes been added tot his batch.
  * @return {bool}
  */
  get empty(){
    return this._writes === 0;
  }

  /**
  * Adds a set write operation to this batch.
  * @param {reference}
  * @param {data}
  * @param {options}
  * @return {promise} resolves when write is validated, or when full batch is committed (if commitWhenFull option set).
  */
  set(...args){
    this._batch.set(...args);
    return this._onWriteAdded();
  }
  /**
  * Adds an update operation to this batch.
  * @param {reference}
  * @param {data}
  * @param {options}
  * @return {promise} resolves when write is validated, or when full batch is committed (if commitWhenFull option set).
  */
  update(...args){
    this._batch.update(...args);
    return this._onWriteAdded();
  }

  /**
  * Execute all pending writes on this batch
  * @return {promise} resolves atomically when and only when all writes have successfully executed.
  */
  commit(){
    if(this.empty){ return Promise.resolve(); }
    return this._batch.commit().then(()=> {
      this._batch = database.batch();
      this._writes = 0;
      return Promise.resolve();
    });
  }

  /**
  * Internal function tracks write count and when batch should be auto-committed if commitWhenFull options set.
  * @return {Promise} resolves when commit succeeds or when writes < max. Rejects when batch is full.
  */
  _onWriteAdded(){
    this._writes++;
    if(this.full && this._options.commitWhenFull){
      return this.commit();
    }else if(this.full){
      return Promise.reject();
    }else{
      return Promise.resolve();
    }
  }

}



module.exports = batch;
