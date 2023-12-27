const postLink = {
  signIn: `/api/auth/sign-in`,
  signUp: `/api/auth/sign-up`,
  checkUsername: `/api/user/check-username`,
  follow: `/api/user/follow`,
};
const getLink = {
  getUserData: `/api/user/data`,
};
const putLink = {};
const deleteLink = {};

module.exports = { getLink, postLink, putLink, deleteLink };
