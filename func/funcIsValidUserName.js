//CHECK USERNAME FONCTION
function isValidUsername(username) {
  var pattern = /^[a-z0-9_]+$/;
  return pattern.test(username);
}

module.exports = isValidUsername;
