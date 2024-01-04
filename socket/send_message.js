const sendMessageSocket = (socket, connectedUsers) => {
  socket.on("send_message", (messageData) => {
    const userSocketID = connectedUsers.get(messageData.to)?.id;
    socket.to(userSocketID)?.emit("receive_message", messageData);
  });
};
module.exports = sendMessageSocket;
