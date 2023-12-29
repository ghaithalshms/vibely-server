const postLink = {
  // AUTH
  signIn: `/api/auth/sign-in`,
  signUp: `/api/auth/sign-up`,
  // USER
  checkUsername: `/api/user/check-username`,
  follow: `/api/user/follow`,
  // POST
  likePost: `/api/post/like`,
  savePost: `/api/post/save`,
  // COMMENT
  likeComment: `/api/comment/like`,
};
const getLink = {
  // ACTIVATE SERVER
  activateServer: `/api/server/activate`,
  // USER
  getUserData: `/api/user/data`,
  getUserFollowers: `/api/user/followers`,
  getUserFollowing: `/api/user/following`,
  // POST FLOW
  getUserPostFlow: `/api/post-flow/user`,
  // POST
  getPostComments: `/api/post/comments`,
};
const putLink = {};
const deleteLink = {};

module.exports = { getLink, postLink, putLink, deleteLink };
