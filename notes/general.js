/* objectives:
faster, easier to develop
performance optimized
structured, easier for teams, maintainable/extendable.
easier and simpler integration with other firebase services.

self-tested, automatic unit test with each node definition, improved unit tests

methods:
  "sugarization"
  reduced redundancy
  code reusability
  built in performant techniques/solutions/algorithms
  'schema' support

*/


/* THE BASICS
    This framework doesn't seek to change the base firebase api.
    The base api is good! This framework builds ontop of it, to
    alleviate the complications of larger projects.
 */


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
