require("dotenv").config();
const jwt = require("jsonwebtoken");
const pool = require("../../pg_pool");

const signIn = async (req, res) => {
  const client = await pool.connect();
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res
        .status(400)
        .json({ error: "Username/email or password is missing" });
    }

    const user = await getUserByUsernameOrEmail(client, usernameOrEmail);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = generateToken(user);
    const browserID = generateUniqueBrowserID();

    res.status(200).json({ token, username: user.username, browserID });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const getUserByUsernameOrEmail = async (client, usernameOrEmail) => {
  const usernameOrEmailVerified = usernameOrEmail.toLowerCase().trim();
  const query = `SELECT username, password, token_version FROM user_tbl 
                 WHERE username = $1 OR email = $1`;

  const result = await client.query(query, [usernameOrEmailVerified]);
  return result.rows[0];
};

const generateToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      tokenVersion: user.token_version,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1000d",
    }
  );
};

const generateUniqueBrowserID = () => {
  return Math.random().toString(16).substring(2) + Date.now().toString(16);
};

module.exports = signIn;
