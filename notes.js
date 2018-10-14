/* objectives:
faster, easier to develop
performance optimized
structured, easier for teams, maintainable/extendable.
easier and simpler integration with other firebase services.


methods:
  "sugarization"
  reduced redundancy
  code reusability
  built in performant techniques/solutions/algorithms
  'schema' support

*/


/* VISIONS */


let users = firestore.collection('users');
let user = users.doc('userId');


/* Basic Firestore Collection Operations */
users.get();
users.orderBy('created', 'desc');
users.where('admin', '==', true);
users.startAfter('userId1');
users.startAt('userId1');
users.endAfter('userId1');

/* BASIC FIRESTORE DOCUMENT OPERATIONS */
user.get();
user.set({created: new Date(), admin: true}, {merge: true});
user.update({admin: false});
user.delete();

/* STATIC DOCUMENT OPERATIONS */
firestore.batch();
firestore.runTransaction((transaction)=> {
  return transaction.get(user).then((doc)=> {
      transaction.update(user, {admin: false});
  });
})
