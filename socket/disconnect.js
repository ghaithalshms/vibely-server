const { Client } = require("pg");

const dissconnectSocket = async (socket, connectedUsers) => {
  socket.on("disconnect", async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_STRING,
    });
    await client.connect();

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
      client?.end();
    }
  });
};

module.exports = dissconnectSocket;
