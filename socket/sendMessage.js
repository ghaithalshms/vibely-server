const sendMessageSocket = (socket, connectedUsers) => {
  socket.on("send_message", (data) => {
    console.log("aa");
    const userSocketID = connectedUsers.get(data.message.to)?.id;
    socket.to(userSocketID)?.emit("receive_message", data.message);
  });
};
module.exports = sendMessageSocket;
