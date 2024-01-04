const setUserSocket = (socket, connectedUsers) => {
  socket.on("set_username", (username) => {
    console.log("user set: ", username);
    connectedUsers.set(username, socket);
  });
};

module.exports = setUserSocket;
