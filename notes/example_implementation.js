const PATHS = {
  user: 'users/{userId}',
  userPack: 'users/{userId}/packs/{packId}',
  userHide: 'users/{userId}/hiddenUsers/{hiddenUserId}',
  userContent: 'users/{userId}/packs/{packId}/content/{contentId}',
  userHiddenContent: 'users/{userId}/packs/{packId}/hiddenContent/{contentId}',
  userVote: 'users/{userId}/packs/{packId}/votes/{contentId}',
  userBadge: 'users/{userId}/packs/{packId}/badges/{badgeId}',
  userBonusItem: 'users/{userId}/packs/{packId}/bonusItems/{itemId}',
  userNotification: 'users/{userId}/packs/{packId}/notifications/{notificationId}',
  userInviteRecipient: 'users/{userId}/inviteRecipients/{recipientId}',

  pack: 'packs/{packId}',
  packNotification: 'packs/{packId}/notifications/{notificationId}',
  packNotificationRead:  'packs/{packId}/notifications/{notificationId}/reads/{userId}',
  packUser: 'packs/{packId}/users/{userId}',
  packRanking: 'packs/{packId}/rankings/{userId}',
  post: 'packs/{packId}/{postId}',
  postHide: 'packs/{packId}/posts/{postId}/hides/{userId}',
  postVote: 'packs/{packId}/posts/{postId}/votes/{userId}',
  postComment: 'packs/{packId}/posts/{postId}/comments/{commentId}',
  commentVote: 'packs/{packId}/posts/{postId}/comments/{commentId}/votes/{userId}',
  commentHide: 'packs/{packId}/posts/{postId}/comments/{commentId}/hides/{userId}',

  moderationContent: 'moderation/{contentId}',
  inviteGroup: 'inviteGroups/{groupId}',
  inviteGroupMember: 'inviteGroups/{groupId}/members/{userId}',
  inviteGroupRecipient: 'inviteGroups/{groupId}/recipients/{userId}',

  archive: 'archives/{archiveId}'
};

const DATA = {
  user: {
    defaultPackId: {type: 'packId', optional: false },
    admin: {type: 'bool'},
  },
  userPack: {
    reference: {to: 'pack', optional: false}, // or fieldName: {type: 'reference', to: 'pack'}
  },
  userHide: {
    reference: {to: 'user', where: {userId: 'hiddenUserId'}, optional: false}
  },
  userContent: {
    reference: {to: ''}
  }

}
let schema = firecraft.firestore.schema();
schema.typedef('userId', 'uid');
schema.typedef('packId', 'id');
schema.typedef('contentId', 'id');
schema.typedef('notificationId', 'id');
schema.typedef('badgeId', 'string');
schema.typedef('itemId', 'string');
schema.typedef('groupId', 'string', 10);
schema.typedef('postId', 'contentId');
schema.typedef('commentId', 'contentId');
schema.typedef('hiddenUserId', 'userId');
schema.typedef('recipientId', 'userId');
schema.defaultField('timestamp');
schema.documents(PATHS, DATA);
/*
 OR
 schema.document('user', PATHS.user, DATA.user);
 schema.document('userPack', PATHS.userPack, DATA.userPack);
 schema.document('userHide', PATHS.userHide, DATA.userHide);
 ...
*/

let docs = functions.firestore.createDocuments(PATHS);
/* or alternatively
    let doc = new function.firestore.collection.document(path);
    functions.firestore.registerDocument('name', doc);
*/

/*  COUPLE LINKS */
functions.auth.user().couple(docs.user);

docs.userPack.couple(docs.packUser);
docs.userHide.couple(docs.userHide, {userId: 'hiddenUserId', hiddenUserId: 'userId'});
docs.post.couple(docs.userContent, {contentId: 'postId'});
docs.comment.couple(docs.userContent, {contentId: 'commentId'});
docs.postHide.couple(docs.userHiddenContent, {contentId: 'postId'});
docs.commentHide.couple(docs.userHiddenContent, {contentId: 'commentId'});
docs.postVote.couple(docs.userVote, {contentId: 'postId'});
docs.commentVote.couple(docs.userVote, {contentId: 'commentId'});

/* DELETE LINKS */
docs.postHide.delete(docs.userVote, {contentId: 'postId'});
docs.commentHide.delete(docs.userVote, {contentId: 'commentId'});

/* DEPENDENCIES */
docs.post.dependent(docs.post.child('{collectionId}'));
docs.postComment.dependent(docs.post.child('{collectionId}'));
docs.packNotification.dependent(docs.packNotificationRead);

/* COUNTERS */
docs.pack.count([docs.post, docs.packUser]);
docs.post.count([docs.postComment, docs.postVote, docs.postHide]);
docs.postComment.count([docs.commentVote, docs.commentHide]);
docs.moderationContent.count([docs.postHide], {contentId: 'postId'});
docs.moderationContent.count([docs.commentHide], {contentId: 'commentId'});
docs.inviteGroup.count([docs.inviteGroupRecipient]);
docs.user.count([docs.userInviteRecipient]);


/* STATISTICS */
let calcVoteStats = ({before,after, delta})=> {
  let pVal = before.value || 0;
  let cVal = after.value || 0;
  if(before.isPollVote || after.isPollVote){
    let results = [0,0,0,0];
    let score = 0;
    if(typeof after.value == 'number') { results[cVal] = 1; }
    else { score = -1; }
    if(typeof before.value == 'number') { results[pVal] = -1; }
    else { score = 1;}
    return {score,results};
  }else{
    let upCount = Math.max(cVal,0) - Math.max(pVal,0);
    let downCount = Math.max(-cVal,0) - Math.max(-pVal,0);
    return {score: cVal, upCount, downCount};
  }
};
docs.post.distributedStatistic(docs.postVote.onCreate, calcVoteStats);
docs.postComment.distributedStatistic(docs.commentVote.onCreate, calcVoteStats);

documents.userPack.reputation(documents.postComment.onWrite, ({delta}) => Math.sign(delta.score)*0.5, {userId: '{uid}'});
documents.userPack.reputation(documents.post.onWrite, ({delta}) => Math.sign(delta.score)*0.5, {userId: '{uid}'});
documents.userPack.reputation(documents.postVote.onCreate, ()=> 0.1);
documents.userPack.reputation(documents.commentVote.onCreate, ()=> 0.1);
documents.userPack.reputation(functions.analytics.event('session_start').onLog,()=> 0.1, {userId: '{user.userId}'});

/* ADMIN HTTPS */
functions.https.onCall('banUser', (data, context)=> {
  return Promise.all([
    //explicit map of '{userId}' is not needed her but leaving for clarity
    docs.userPackContent.instance(data, {userId: '{userId}', packId: '*'}).delete(),
    docs.user.instance(data).update({writeAccessRevoked: true}),
    admin.user(data.uid).setCustomUserClaims({writeAccessRevoked: true}),   //@TODO check this
  ]);
}, {admin: true});

functions.https.onCall('removeContentFromModeration', (data)=> {
  return docs.moderationContent.instance(data).delete();
},{admin: true});
functions.https.onCall('deleteContent', (data)=> {
  return functions.firestore.reference.parse(data.path).archive('infringement');
}, {admin: true});

functions.https.onCall('activateContent', (data)=> {
  return functions.firestore.reference.parse(data.path).update({active: true});
}, {admin: true});

functions.https.onCall('flagContent', (data)=> {
  return docs.moderationContent.instance(data).set(data);
}, {admin: true});

functions.https.onCall('getModerationContent', (data)=> {
  //assumes data contacts query parameters taken by get
  return docs.moderationContent.collection.get(data); //@TODO decide on get/query design
}, {admin: true});

functions.https.onCall('notifyPackOfAdminPost', (data)=> {
  return docs.packNotification.instance(data).set(data);
}, {admin: true});

/* USER HTTPS */
functions.https.onCall('createPack', (data)=> {
  /*
    may be a good idea to explicitly state somewhere what these
    instance/set function require.
  */
  return docs.pack.instance(data).set(data);
}, {admin: true});

const THREE_DAYS = 1000*60*60*24*3;
const DIST_SIZE = 3;

//@TODO is this code simplfied enough? is it self-documenting?
functions.https.onCall('processInviteReceipt', (data, context)=> {
  let { invitedBy } = data;
  docs.user.instance(data).transaction((doc, t)=> {
    let userData = doc.data();
    if(doc.exists && userData.invitedBy){
      return Promise.reject("User already invited.");
    }else if(doc.exists){
      t.update({invitedBy})
    }else{
      t.set({invitedBy});
    }
    return userData.defaultPackId;
  }).then((defaultPackId)=> {
    let multiplier = docs.userBonusItem.instance(data, {itemId: 'shiny_stone'});
    let batch = [
      docs.userBadge.instance(data, {badgeId: 'invited_by'}).set(), //default set activated
      multiplier.set({value: 2, endTime: new Date().setTime(new Date().getTime() + THREE_DAYS)}),
      docs.userPack.instance(data, {packId: defaultPackId}).updateDistribution({multiplier: multiplier.ref}),
    ];

    if(data.groupCode){
      batch = batch.concat([
        docs.inviteGroupRecipient.instance(data).set({invitedBy}), //@TODO implement defaults
        docs.inviteGroupMember.instance(data, {userId: invitedBy}).increment({recipientCount: 1}),
        docs.userInviteRecipient.instance(data, {userId: invitedBy}).set(),
      ]);
    }

    return Promise.all(batch);
  });
});

functions.runWith({ timeoutSeconds: 540,memory: '2GB',})
.pubsub.topic('daily-tick').onPublish('calculateRankings', (message)=> {
  let batchSize = 10;
  let batch = new functions.firestore.batch();
  return docs.pack.collection.forEachDocument((packDoc)=> {
    return docs.packUser.collection.instance({packId: packDoc.id}).forEachDocument((userDoc)=> {
      let instanceData = {userId: userDoc.id, packId: packDoc.id};
      return docs.userPack.instance(instanceData).get().then((userPackDoc)=> {
        let reputation = userPackDoc.exists ? userPackDoc.data().reputation : 0;
        return docs.packRanking.instance(instanceData).set({reputation}, {merge: true, batch});
      });
    },{batchSize}).then(batch.commit).then(()=> {
      let options = {batchSize, orderBy: 'reputation', direction: 'asc'}
      return docs.packRanking.collection.instance({packId: packDoc.id}).forEachDocument((rankDoc, i)=> {
        //convert to framework reference to exploit underlying optimizations such as auto batch writes
        return functions.firestore.document.fromReference(rankDoc.ref).update({rank: i, }, {batch});
      }, options);
    }).then(batch.commit);
  }, {batchSize})
});


exports = functions.export();
