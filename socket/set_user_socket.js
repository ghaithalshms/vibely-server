const setUserSocket = (socket, connectedUsers) => {
  socket.on("set_username", (username) => {
    connectedUsers.set(username, socket);
  });
};

module.exports = setUserSocket;
