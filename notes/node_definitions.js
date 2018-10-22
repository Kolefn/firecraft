
/* COUPLE NODE BREAKDOWN */

functions.firestore.document.node('couple', (doc, docToCouple, mapping)=> {
  doc.create(docToCouple, mapping);
  doc.dependent(docToCouple, mapping);
  docToCouple.create(doc.name, functions.util.inverseMap(mapping));
  docToCouple.dependent(doc.name, functions.util.inverseMap(mapping));
});


functions.firestore.document.node('create', (doc, docToCreate, mapping)=> {
  doc.onCreate((snapshot)=> docToCreate.instance(snapshot, mapping).set(snapshot.data()));
});

functions.firestore.document.node('dependent', (doc, dependentDoc, mapping)=> {
  doc.onDelete((snapshot)=> dependentDoc.instance(snapshot, mapping).delete());
});


/* ============ */


/*
      COUNT NODE BREAKDOWN
      This node keeps count of document(s) by +/-
      a counter field on the root document.

*/

functions.firestore.document.node('count', (root, documentsToCount, mapping)=> {
  for(let i in documentsToCount){
    let doc = documentsToCount[i];
    doc.onCreate((snapshot)=> root.instance(snapshot, mapping).incrementField(snapshot.ref.parent.id, 1));
    doc.onDelete((snapshot)=> root.instance(snapshot, mapping).incrementField(snapshot.ref.parent.id, -1));
  }
})


/* ======================================= */


/*
    STATISTICS Node BREAKDOWN
    There is a need for counts dependent on document data,
    not the existence of the document itself.
*/

functions.firestore.document.node('statistic', (root, event, calculation, mapping)=> {
  event([(data)=> root.instance(data, mapping).increment(calculation(data)))]));
});

/* DISTRIBUTED STATISTIC COUNTER IMPLEMENTATION */

functions.firestore.document.node('distributedStatistic', (root, event, calculation, shards=3, mapping)=> {
  let child = root.child('shards/{shardId}');
  let shardId = '!' + shards; // ! indicates random to the instance function
  child.statistic({source, calculation, mapping: functions.cloneMap(mapping, {shardId}), triggers});
  child.onCreate((snapshot)=>  root.instance(snapshot, mapping).increment(functions.getDelta({}, snapshot.data()));
  //no delete because shards are dependent on their parent - thus no need to update the parent
  child.onUpdate((change)=>  root.instance(change, mapping).increment(functions.getDelta(change.before.data(), change.after.data()));
});


/*   MULTIPLIER RELATED NODES */

functions.firestore.document.node('multIncrement', (root, incrementation)=> {
  root.transaction((doc, t)=> {
    let data = doc.exists ? doc.data() : {};
    let task = Promise.resolve(incrementation);
    if(data.multiplierRef){
      let multiplier = functions.firestore.reference(data.multiplierRef);
      task = multiplier.get({fields: ['value', 'endTime']}).then((data)=> {
          if(data.endTime && data.endTime.getDate() - new Date() < 0){
            multiplier.delete();
            return Promise.resolve(incrementation);
          }else{
            let inc = {};
            for(let key in incrementation){
              inc[key] = incrementation[key] * (data.value || 1);
            }
            return Promise.resolve(inc);
          }
      }).catch((e)=> Promise.resolve(incrementation));
    }
    task.then((inc)=> {
      let newData = functions.util.addObjects([data, inc]);
      doc.exists ? t.update(newData) : t.set(newData, {merge: true});
    });
  });
});


/* reputation NODE */

functions.firestore.document.node('reputation', (root, event, calculation, mapping)=> {
  let child = root.child('shards/{shardId}');
  let shardId = '!3'; // ! indicates random to the instance function
  event([(data)=> child.instance(data, functions.cloneMap(mapping, {shardId})).multIncrement(calculation(data)))]));
  child.onCreate((snapshot)=>  root.instance(snapshot, mapping).increment(functions.getDelta({}, snapshot.data()));
  //no delete because shards are dependent on their parent - thus no need to update the parent
  child.onUpdate((change)=>  root.instance(change, mapping).increment(functions.getDelta(change.before.data(), change.after.data()));
});


/* =================================== */




/* REFERENCE INCREMENT NODE */

functions.firestore.reference.node('increment', (root, incrementation)=> {
  root.transaction((doc, t)=> {
    let data = doc.exists ? doc.data() : {};
    let newData = functions.util.addObjects([data, incrementation]);
    doc.exists ? t.update(newData) : t.set(newData, {merge: true});
  });
});


/* UPDATE DISTRIBUTION node */

functions.firestore.reference.node('updateDistribution', (root, update)=> {
  let doc = root.child('shards/{shardId}');
  for(let i = 0; i < 3; i++){
    doc.instance({shardId: i}).set(update, {merge: true});
  }
})


/* onBatch node */


functions.firestore.collection.instance.node('onBatch', (instance, options, func)=> {
  let cursor = options.startAfter;
  let index = 0;
  let batch = ()=> {
      let getOptions = {...options, startAfter: cursor, limit: options.size || 20, orderBy: options.orderBy || '__name__'};
      return instance.get(getOptions).then((snapshot)=> {
        if(snapshot.size == 0){ return Promise.resolve(); }
        let last;
        snapshot.forEach((doc)=> {
          func(doc, index);
          index++;
          doc.exists && last = doc;
        });
        cursor = options.orderBy ? doc.data()[options.orderBy] : doc.id;
        return process.tick(()=> batch());
    });
  };

  return batch();
});







/* UTILITIES */

functions.function('addArrays', (arrays=[]) => {
  let longest = 0;
  for(let i = 0; i < arrays.length; i++){
    try {
      let len = arrays[i].length;
      if(len > longest){ longest = len; }
    }catch(e){
      continue;
    }
  }
  let sum = [];
  for(let a = 0; a < arrays.length; a++){
    try {
      let array = arrays[a];
      let len = array.length;
      for(let i = 0; i < longest; i++){
        if(i >= len){ break; }
        let val = array[i];
        if(typeof val !== 'number'){ continue; }
        if(typeof sum[i] == 'number'){ sum[i] += val; }
        else { sum[i] = val; }
      }
    }catch(e){
      continue;
    }
  }
  return sum;
});

functions.util.addObjects = (objects=[]) => {
  let sum = {};
  for(let i = 0; i < objects.length; i++){
    let obj = objects[i];
    try {
      for(let p in obj){
        let val = obj[p];
        if(typeof sum[p] == 'number' && val == 'number'){
          sum[p] += val;
          continue;
        }else if(typeof val == 'number'){
          sum[p] = val;
          continue;
        }
        let s = sum[key];
        let sArray = Array.isArray(s);
        let vArray = Array.isArray(val);
        if(sArray && vArray){
          sum[key] = functions.util.addArrays([s, val]);
          continue;
        }else if(vArray){
          sum[key] = val;
          continue;
        }
        let vIsObject = typeof val == 'object';
        if(typeof s == 'object' && vIsObject){
          sum[key] = functions.util.addObjects([s, val]);
        }else if(vIsObject) {
          sum[key] = val;
        }
      }
    }catch(e){
      continue;
    }
  }
  return sum;
});
