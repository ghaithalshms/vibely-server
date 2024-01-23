const { Client } = require("pg");
const dissconnectSocket = async (socket, connectedUsers) => {
  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  client.on("error", (err) => {
    console.log("postgres erR:", err);
  });

  socket.on("disconnect", async () => {
    try {
      let disconnectedUsername = null;
      connectedUsers.forEach((value, key) => {
        if (value === socket) disconnectedUsername = key;
      });
      if (disconnectedUsername) {
        connectedUsers.delete(disconnectedUsername);
        await client.connect();
        client.query(`UPDATE user_tbl SET last_seen=$1 WHERE username=$2`, [
          new Date().toISOString(),
          disconnectedUsername,
        ]);
      }
    } catch (err) {
      if (client?.connected) client.end().catch(() => {});
      console.error("unexpected error : ", err);
    } finally {
      if (client?.connected) client.end().catch(() => {});
    }
  });
};

module.exports = dissconnectSocket;
