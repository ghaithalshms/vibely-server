const _pool = require("../../pg_pool");

require("dotenv").config();

const GetUserPicture = async (req, res) => {
  const { username } = req.query;

  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }

    const pictureQuery = await _pool.query(
      "SELECT picture FROM user_tbl WHERE username = $1",
      [username]
    );

    if (!res.headersSent) res.send(pictureQuery.rows[0]);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = GetUserPicture;
