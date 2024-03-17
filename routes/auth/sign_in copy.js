require("dotenv").config();
const jwt = require("jsonwebtoken");
const pool = require("../../pg_pool");

const signIn = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));
  client.on("error", (err) => console.log(err));

  try {
    if (!(usernameOrEmail && password)) {
      res.status(400).json("data missing");
      return;
    }

    const usernameOrEmailVerified = usernameOrEmail.toLowerCase().trim();

    const generateUniqueBrowserID = () => {
      return Math.random().toString(16).substring(2) + Date.now().toString(16);
    };

    if (usernameOrEmailVerified && password) {
      const tokenResult = await client.query(
        `SELECT username, password, token_version FROM user_tbl 
        WHERE username = $1 OR email = $1`,
        [usernameOrEmailVerified]
      );

      if (tokenResult.rows.length > 0) {
        if (tokenResult.rows[0].password === password) {
          const token = jwt.sign(
            {
              username: tokenResult.rows[0].username,
              tokenVersion: tokenResult.rows[0].token_version,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1000d",
            }
          );

          const username = tokenResult.rows[0].username;
          const browserID = generateUniqueBrowserID();

          res.status(200).json({ token, username, browserID });
        } else {
          if (!res.headersSent)
            res.status(401).json("Password is not correct!");
        }
      } else {
        if (!res.headersSent) res.status(404).json("User not exist!");
      }
    } else {
      if (!res.headersSent) res.status(404).json(`Empty input`);
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = signIn;
