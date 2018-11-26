module.exports = {
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
