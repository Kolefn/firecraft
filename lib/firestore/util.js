/**
* Returns the internal data from various Firestore data structures. This
* function will return back any other input that is not a Firestore data structure.
* This function will prioritize data under change.after when passed a firestore Change object.
* You may also pass event context along with snapshot & change structures. Any context params will be added.
* @param {Object} obj [Change]{@link https://firebase.google.com/docs/reference/functions/functions.Change} or [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/functions/functions.firestore.DocumentSnapshot} or plain Object
*/
module.exports.extractData = (obj) => {
  let data = obj;
  if(obj == null || obj == undefined){ return null; }
  if(obj.snapshot && typeof obj.snapshot.data == 'function'){ data = obj.snapshot.data(); }
  else if(obj.change) { data = obj.change; }
  else if(typeof obj.data == 'function'){ data = obj.data(); }
  if(obj.after && typeof obj.after.data == 'function'){ data = obj.after.data(); }
  if(obj.before && typeof obj.before.data == 'function'){ data =  obj.before.data(); }
  if(obj.context){ data = Object.assign(data, obj.context.params); }
  return data;
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
