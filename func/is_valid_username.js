//CHECK USERNAME FONCTION
function funcIsValidUsername(username) {
  var pattern = /^[a-z0-9_]+$/;
  return pattern.test(username);
}

module.exports = funcIsValidUsername;
