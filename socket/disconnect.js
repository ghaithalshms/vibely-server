const { Pool } = require("pg");
const dissconnectSocket = async (socket, connectedUsers) => {
  socket.on("disconnect", async () => {
    try {
      let disconnectedUsername = null;
      connectedUsers.forEach((value, key) => {
        if (value === socket) disconnectedUsername = key;
      });
      if (disconnectedUsername) {
        connectedUsers.delete(disconnectedUsername);
        const pool = new Pool({
          connectionString: process.env.DATABASE_STRING,
          connectionTimeoutMillis: 5000,
        });
        pool.query(`UPDATE user_tbl SET last_seen=$1 WHERE username=$2`, [
          new Date().toISOString(),
          disconnectedUsername,
        ]);
      }
    } catch (error) {}
  });
};

module.exports = dissconnectSocket;
