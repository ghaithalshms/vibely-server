const funcIsValidUsername = require("../../func/funcIsValidUserName");
const { Pool } = require("pg");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });

  try {
    await pool
      .connect()
      .then()
      .catch(() => res.status(500).json("DB connection error"));

    const { username, firstName, password, email } = req.body;

    if (username && firstName && password && email) {
      if (funcIsValidUsername(username)) {
        client = await pool.connect();
        const usernameQuery = await client.query(
          "SELECT username FROM user_tbl WHERE username =$1",
          [username]
        );
        if (usernameQuery.rows.length === 0) {
          await client.query(
            "INSERT INTO user_tbl (username, password, email, first_name, created_date)" +
              "values ($1, $2, $3, $4, $5)",
            [username, password, email, firstName, new Date().toISOString()]
          );
          res.status(201).json("Your account has been created. Welcome!");
        } else res.status(409).json("Username is already taken.");
      } else res.status(400).json("Username is not available.");
    }
  } catch (err) {
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    pool.end();
  }
};

module.exports = signUp;
