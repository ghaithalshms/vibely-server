require("dotenv").config();
const jwt = require("jsonwebtoken");

async function CheckTokenNoDB(token) {
  try {
    if (!token) return false;
    const decoded = {
      username: jwt.verify(token, process.env.JWT_SECRET_KEY).username,
      tokenVersion: jwt.verify(token, process.env.JWT_SECRET_KEY).tokenVersion,
    };
    return decoded.username;
  } catch (error) {
    return false;
  }
}

module.exports = CheckTokenNoDB;
