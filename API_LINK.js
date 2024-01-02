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
  // NOTIFICATION
  getNotification: `/api/notification`,
};

const deleteLink = {
  // POST
  deletePost: `/api/post/delete`,
  // COMMENT
  deleteComment: `/api/comment/delete`,
  // USER
  deleteFollowRequest: `/api/user/follow/request/delete`,
};

const updateLink = {
  // POST
  archivePost: `/api/post/archive`,
};

module.exports = { getLink, postLink, updateLink, deleteLink };
