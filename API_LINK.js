const postLink = {
  // AUTH
  signIn: `/api/auth/sign-in`,
  signUp: `/api/auth/sign-up`,
  // USER
  checkUsername: `/api/user/check-username`,
  follow: `/api/user/follow`,
  acceptFollowRequest: `/api/user/follow/request/accept`,
  // POST
  createPost: `/api/post/create`,
  likePost: `/api/post/like`,
  savePost: `/api/post/save`,
  // COMMENT
  likeComment: `/api/comment/like`,
  createComment: `/api/comment/create`,
  // CHAT
  sendMessageToDB: `/api/chat/send-message`,
  // WEB PUSH NOTIFICATION
  subscribeWebPush: `/api/notification/subscribe`,
};
const getLink = {
  // ACTIVATE SERVER
  activateServer: `/api/server/activate`,
  // USER
  getUserData: `/api/user/data`,
  getUserPicture: `/api/user/data/picture`,
  getUserFollowers: `/api/user/followers`,
  getUserFollowing: `/api/user/following`,
  getSearchUser: `/api/user/search`,
  // POST FLOW
  getHomePostFlow: `/api/post-flow/home`,
  getUserPostFlow: `/api/post-flow/user`,
  getExplorerPostFlow: `/api/post-flow/explorer`,
  getLikedPostFlow: `/api/post-flow/liked`,
  getSavedPostFlow: `/api/post-flow/saved`,
  getArchivedPostFlow: `/api/post-flow/archived`,
  // POST
  getPostComments: `/api/post/comments`,
  getPostLikedUsers: `/api/post/liked-users`,
  getPostFile: `/api/post/file`,
  // NOTIFICATION
  getNotification: `/api/notification`,
  getNotificationCount: `/api/notification/count`,
  // INBOX
  getInbox: `/api/inbox`,
  getMessagesCount: `/api/inbox/count`,
  // CHAT
  getChat: `/api/chat`,
  getMessageFile: `/api/chat/message-file`,
  // SUGGESTIONS
  getSuggestions: `/api/suggestions`,
  // SPOTIFY API
  spotifyLogin: "/spotify-login",
  spotifyCallback: "/spotify-callback",
  spotifySearch: "/spotify-search",
  spotifyPlay: "/spotify-play",
};

const deleteLink = {
  // POST
  deletePost: `/api/post/delete`,
  // COMMENT
  deleteComment: `/api/comment/delete`,
  // USER
  deleteFollowRequest: `/api/user/follow/request/delete`,
  // WEB PUSH NOTIFICATIONS
  unsubscribeWebPush: `/api/notification/unsubscribe`,
  // Chat
  deleteMessage: `/api/chat/message/delete`,
};

const updateLink = {
  // AUTH
  forgotPassword: `/api/auth/forgot-password`,
  resetPassword: `/api/auth/reset-password`,
  // POST
  archivePost: `/api/post/archive`,
  unarchivePost: `/api/post/unarchive`,
  // USER
  updateProfileData: `/api/user/update/data`,
  updateProfilePicture: `/api/user/update/picture`,
  // CHAT
  setMessagesSeen: `/api/chat/seen`,
  // NOTIFICATION
  setNotificationSeen: `/api/notification/seen`,
};

module.exports = { getLink, postLink, updateLink, deleteLink };
