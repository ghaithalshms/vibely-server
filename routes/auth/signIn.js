const { Pool } = require("pg");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const signIn = async (req, res) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });

  try {
    await pool
      .connect()
      .then()
      .catch(() => res.status(500).json("DB connection error"));

    const { usernameOrEmail, password } = req.body;

    if (usernameOrEmail && password) {
      const tokenResult = await pool.query(
        `SELECT username, password, token_version FROM user_tbl 
        WHERE username = $1 OR email = $1`,
        [usernameOrEmail]
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

          res
            .status(200)
            .json({ token, username: tokenResult.rows[0].username });
        } else {
          res.status(401).json("Password is not correct!");
        }
      } else {
        res.status(404).json("User not exist!");
      }
    } else {
      res.status(404).json(`Empty input`);
    }
  } catch (err) {
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    pool.end();
  }
};

module.exports = signIn;
