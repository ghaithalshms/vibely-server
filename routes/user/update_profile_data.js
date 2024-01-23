const { Client } = require("pg");
const checkToken = require("../../func/check_token");

const UpdateProfileData = async (req, res) => {
  const { token, username, firstName, lastName, biography, link, privacity } =
    req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 30000,
  });
  client.on("error", (err) => {
    console.log("postgres erR:", err);
  });

  try {
    if (!(token && username)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }
    await client.connect();

    // DEFINITION OF FUNCTIONS
    const handleUpdateProfileData = async () => {
      await client.query(
        `UPDATE user_tbl 
        SET username=$1,
        first_name=$2,
        last_name=$3,
        biography=$4,
        link=$5,
        privacity=$6
        WHERE username=$7`,
        [
          username,
          firstName,
          lastName,
          biography,
          link,
          privacity,
          tokenUsername,
        ]
      );
      if (!res.headersSent) res.status(200).json("data updated");
    };
    handleUpdateProfileData();
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = UpdateProfileData;
