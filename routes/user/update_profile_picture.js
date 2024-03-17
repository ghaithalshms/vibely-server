const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const UpdateProfilePicture = async (req, res) => {
  const { token } = req.body;
  const file = req.file;
  const buffer = file ? file.buffer : null;

  const client = await pool.connect().catch((err) => console.log(err));
  client.on("error", (err) => console.log(err));
  try {
    if (!token) {
      res.status(401).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    // DEFINITION OF FUNCTIONS
    const handleUpdateProfilePicture = async () => {
      await client.query(
        `UPDATE user_tbl 
        SET picture=$1
        WHERE username=$2`,
        [buffer, tokenUsername]
      );
      if (!res.headersSent) res.status(200).json("pfp updated");
    };
    handleUpdateProfilePicture();
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = UpdateProfilePicture;
