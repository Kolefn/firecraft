/**
* Returns the internal data from various Firestore data structures. This
* function will return back any other input that is not a Firestore data structure.
* This function will prioritize data under change.after when passed a firestore Change object.
* You may also pass event context along with snapshot & change structures. Any context params will be added.
* @param {Object} obj [Change]{@link https://firebase.google.com/docs/reference/functions/functions.Change} or [DocumentSnapshot]{@link https://firebase.google.com/docs/reference/functions/functions.firestore.DocumentSnapshot} or plain Object
*/
let extractData = (obj) => {
  let data = obj;
  if(obj == null || obj == undefined){ return null; }
  if(obj.eventData && typeof obj.eventData.data == 'function'){ data = obj.eventData.data() }
  else if(obj.eventData && obj.eventData.after){ data = obj.eventData}
  else if(obj.snapshot && typeof obj.snapshot.data == 'function'){ data = obj.snapshot.data(); }
  else if(obj.change) { data = obj.change; }
  else if(typeof obj.data == 'function'){ data = obj.data(); }
  if(data.after && typeof data.after.data == 'function'){ data = data.after.data(); }
  if(data.before && typeof data.before.data == 'function'){ data =  data.before.data(); }
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

let {isNil, isPlainObject} = require('lodash');

/**
 * Adds the prop values of base object to the prop values of another.
 * Can also subtract values when options.subtract equals true.
 * Supports array props and nested objects.
 * @param {object} delta the object of prop values to be added
 * @param {object} base object with initial prop values
 * @parma {object} options {subtract: false}
 * @return {object} new object with final prop values
 */
let computeTransactionUpdateObject = (delta, base, options={}) => {
  let update = {};
  for(let key in delta){
    let d = delta[key];
    let b = base[key];
    if(isNil(b)){
      update[key] = d;
    }else if(typeof d == 'number' && typeof b == 'number'){
      if(Number.isNaN(d)){
        update[key] = b;
      }else if(Number.isNaN(b)){
        update[key] = d;
      }else {
        update[key] = d + (options.subtract ? -b : b);
      }
    }else if(isPlainObject(d) && isPlainObject(b)){
      update[key] = computeTransactionUpdateObject(d,b);
    }else if(Array.isArray(d) && Array.isArray(b)){
      let length = Math.max(d.length, b.length);
      let arr = [];
      for(let i = 0; i < length; i++){
        let sum = 0;
        let di = d.length > i ? d[i] : 0;
        let bi = b.length > i ? b[i] : 0;
        if(isNil(bi) || Number.isNaN(bi)){
          sum = di;
        }else if(typeof di == 'number' && typeof bi == 'number'){
          sum = di + (options.subtract ? -bi : bi);
        }else {
          sum = bi;
        }
        arr.push(sum);
      }
      update[key] = arr;
    }
  }
  return update;
}


module.exports.extractData = extractData
module.exports.doAsyncTasksSynchronously = doAsyncTasksSynchronously;
module.exports.computeTransactionUpdateObject = computeTransactionUpdateObject;
