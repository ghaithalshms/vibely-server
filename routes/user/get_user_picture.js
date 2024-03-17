const { GetFileFireBase } = require("../../firebase/file_process");
const pool = require("../../pg_pool");
require("dotenv").config();

const GetUserPicture = async (req, res) => {
  const { username } = req.query;
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }

    const pictureQuery = await client.query(
      "SELECT pfp_path FROM user_tbl WHERE username = $1",
      [username]
    );
    const pfpPath = pictureQuery.rows[0].pfp_path;

    if (!res.headersSent) {
      if (pfpPath) {
        GetFileFireBase(pfpPath)
          .then((url) => {
            res.redirect(url);
          })
          .catch((err) => {
            res.redirect(
              "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
            );
            console.log(err);
          });
      } else {
        res.redirect(
          "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
        );
      }
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetUserPicture;
