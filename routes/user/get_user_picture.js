const _pool = require("../../pg_pool");
require("dotenv").config();
const fs = require("fs").promises;

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
    const pfp = pictureQuery.rows[0].picture;

    if (!res.headersSent) {
      res.setHeader("Content-Type", "image/png");
      if (pfp) {
        res.send(pfp);
      } else {
        const defaultPicture = await fs.readFile(
          `${__dirname}/default_profile_picture.jpg`
        );
        res.send(defaultPicture);
      }
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  }
};

module.exports = GetUserPicture;
