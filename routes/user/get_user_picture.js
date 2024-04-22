const { GetFileFromFireBase } = require("../../firebase/get_file.js");
const { Pool } = require("pg");
require("dotenv").config();

const GetUserPicture = async (req, res) => {
  const { username } = req.query;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  if (!username) {
    res.status(400).json("Data missing");
    return;
  }

  try {
    const pictureQuery = await client.query(
      "SELECT pfp_path FROM user_tbl WHERE username = $1",
      [username]
    );
    const pfpPath = pictureQuery.rows[0]?.pfp_path;
    const defaultPfpUri =
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?20200418092106";

    if (pfpPath) {
      GetFileFromFireBase(pfpPath)
        .then((url) => {
          res.redirect(url);
        })
        .catch((err) => {
          res.redirect(defaultPfpUri);
          console.error("Error getting user picture:", err);
        });
    } else {
      res.redirect(defaultPfpUri);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = GetUserPicture;
