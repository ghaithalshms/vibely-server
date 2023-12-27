const { Pool } = require("pg");
const dissconnectSocket = async (socket, connectedUsers) => {
  let pool = new Pool({ connectionString: process.env.DATABASE_STRING });

  socket.on("disconnect", async () => {
    try {
      let disconnectedUsername = null;
      connectedUsers.forEach((value, key) => {
        if (value === socket) disconnectedUsername = key;
      });
      if (disconnectedUsername) {
        connectedUsers.delete(disconnectedUsername);
        client = await pool.connect();
        client.query(`UPDATE user_tbl SET last_seen=$1 WHERE username=$2`, [
          new Date().toISOString(),
          disconnectedUsername,
        ]);
      }
    } catch (error) {
    } finally {
      try {
        client.release();
      } catch (error) {}
    }
  });
};

module.exports = dissconnectSocket;
