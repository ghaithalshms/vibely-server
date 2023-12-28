const postLink = {
  // AUTH
  signIn: `/api/auth/sign-in`,
  signUp: `/api/auth/sign-up`,
  // USER
  checkUsername: `/api/user/check-username`,
  follow: `/api/user/follow`,
};
const getLink = {
  // USER
  getUserData: `/api/user/data`,
  getUserFollowers: `/api/user/followers`,
  getUserFollowing: `/api/user/following`,
  // POST FLOW
  getUserPostFlow: `/api/post-flow/user`,
};
const putLink = {};
const deleteLink = {};

module.exports = { getLink, postLink, putLink, deleteLink };
