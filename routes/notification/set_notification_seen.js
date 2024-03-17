const CheckTokenNoDB = require("../../func/check_token_no_db");
const pool = require("../../pg_pool");

require("dotenv").config();

const SetNotificationSeen = async (req, res) => {
  const { token } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));
  client.on("error", (err) => console.log(err));

  try {
    if (!token)
      if (!res.headersSent) {
        res.status(400).json("missing data");
        return;
      }

    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const handleSetNotificationSeen = async () => {
      await client.query(
        `UPDATE notification_tbl SET seen=true WHERE noti_to=$1`,
        [tokenUsername]
      );
      if (!res.headersSent) res.status(200).json("seen");
    };
    handleSetNotificationSeen();
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = SetNotificationSeen;
