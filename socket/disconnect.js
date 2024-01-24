const _pool = require("../pg_pool");

const dissconnectSocket = async (socket, connectedUsers) => {
  socket.on("disconnect", async () => {
    try {
      let disconnectedUsername = null;
      connectedUsers.forEach((value, key) => {
        if (value === socket) disconnectedUsername = key;
      });
      if (disconnectedUsername) {
        connectedUsers.delete(disconnectedUsername);

        _pool.query(`UPDATE user_tbl SET last_seen=$1 WHERE username=$2`, [
          new Date().toISOString(),
          disconnectedUsername,
        ]);
      }
    } catch (err) {
      console.log("unexpected error : ", err);
    }
  });
};

module.exports = dissconnectSocket;
