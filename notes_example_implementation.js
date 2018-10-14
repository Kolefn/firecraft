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

let documents = functions.firestore.createDocuments(PATHS);

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
docs.post.dependent(docs.post.child('*'));
docs.postComment.dependent(docs.post.child('*'));
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
functions.https.onAdminCall('banUser').delete('userPackContent', {packId: '*'}).update('user', {writeAccessRevoked: true})
                                      .setCustomUserClaims({writeAccessRevoked: true});

functions.https.onAdminCall('removeContentFromModeration').delete('moderationContent');
functions.https.onAdminCall('deleteContent').archive('{path}', 'archive', {archiveId: 'infringement'});
functions.https.onAdminCall('activateContent').update('{path}');
functions.https.onAdminCall('flagContent').create('moderationContent');
functions.https.onAdminCall('getModerationContent').get('moderationContent', {contentId: '*'});
functions.https.onAdminCall('notifyPackOfAdminPost').create('packNotification');

/* USER HTTPS */
functions.https.onCall('createPack').create('pack');

const THREE_DAYS = 1000*60*60*24*3;
const DIST_SIZE = 3;

functions.function.node('multiplierFlag')
  .input(['document','params'])
  .child('{document}', 'shard', 'shards/{shardId}')
  .for(DIST_SIZE, (chain, i)=> {
    chain.document('shard', {shardId: i}).set('shard', '{param}');
  });

let processInviteReceipt = functions.function()
  .validate({invitedBy: 'string', recipientId: '{context.auth.uid}'})
  .variables({userId: '{recipientId}'})
  .set('user', {invitedBy: '{invitedBy}'}, {overrideFields: false})
  .variables({packId: '{defaultPackId}'})
  .document('userBadge', {badgeId: 'invited_by'})
  .set('userBadge')
  .document('userBonusItem', {itemId: 'shiny_stone'})
  .set('userBonusItem', {value: 2, endTime: new Date().setTime(new Date().getTime() + THREE_DAYS)})
  .multiplierFlag('userPack', {multiplier: '{bonusItem}'})
  .document('inviteGroupRecipient',{groupId: '{groupCode}'})
  .set('inviteGroupRecipient', {invitedBy: '{invitedBy}'})
  .document('inviteGroupMember', {userId: '{invitedBy}'})
  .count('inviteGroupMember', {recipientCount: 1});
  .document('userInviteRecipient', {userId: '{invited_by}'})
  .set('userInviteRecipient');


functions.https.onCall('processInviteReceipt').run(processInviteReceipt);


exports = functions.export();
