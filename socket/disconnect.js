const { Pool } = require("pg");

const dissconnectSocket = async (socket, connectedUsers) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect();
  socket.on("disconnect", async () => {
    try {
      let disconnectedUsername = null;
      connectedUsers.forEach((value, key) => {
        if (value === socket) disconnectedUsername = key;
      });
      if (disconnectedUsername) {
        connectedUsers.delete(disconnectedUsername);

        await client.query(
          `UPDATE user_tbl SET last_seen=$1 WHERE username=$2`,
          [new Date().toISOString(), disconnectedUsername]
        );
      }
    } catch (err) {
      console.log("unexpected error : ", err);
    } finally {
      await client?.release();
    }
  });
};

module.exports = dissconnectSocket;
