const messageSeenSocket = (socket, connectedUsers) => {
  socket.on("set_message_seen", (messageData) => {
    try {
      const userSocketID = connectedUsers.get(messageData.from)?.id;
      socket.to(userSocketID)?.emit("get_message_seen", messageData.id);
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = messageSeenSocket;
