/**
* Gets the internal data from various Firestore data structures. This
* function will return back any other input that is not a Firestore data structure.
* This function will prioritize data under change.after when passed a firestore Change object.
* @param {Object} obj [Change]{@link https://firebase.google.com/docs/reference/functions/functions.Change} or [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/functions/functions.firestore.DocumentSnapshot} or plain Object
*/
module.exports.extractData = (obj) => {
  if(obj == null || obj == undefined){ return null; }
  if(obj.after && typeof obj.after.data == 'function'){ return obj.after.data(); }
  if(obj.before && typeof obj.before.data == 'function'){ return obj.before.data(); }
  if(typeof obj.data == 'function'){ return obj.data(); }
  return obj;
}
/**
* Perform multiple asynchronous tasks synchronously.
* @param {Array} data containing ordered task data
* @param {Function} task that returns a promise
* @param {Number} index for internal use
* @return {Promise}
*/
let doAsyncTasksSynchronously = function(data=[], task, index=0){
  if(index >= data.length){ return Promise.resolve(); }
  return task(data[index]).then(()=> {
    index++;
    doAsyncTasksSynchronously(data, task, index);
  });
}

module.exports.doAsyncTasksSynchronously = doAsyncTasksSynchronously;
