const { Client } = require("pg");
const checkToken = require("../../func/check_token");

const UpdateProfilePicture = async (req, res) => {
  const { token } = req.body;
  const file = req.file;
  const buffer = file ? file.buffer : null;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
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
    await client.connect();

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
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = UpdateProfilePicture;
