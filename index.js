const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { postLink, getLink, deleteLink, putLink } = require("./API_LINK");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE"],
  },
});

const connectionToSocket = require("./socket/connection");
// IMPORT ROUTES
// AUTH
const SignIn = require("./routes/auth/signIn");
const SignUp = require("./routes/auth/signUp");
// USER
const CheckUsername = require("./routes/user/checkUsername");
const GetUserData = require("./routes/user/getUserData");
const Follow = require("./routes/user/follow");
const GetFollowers = require("./routes/user/userList/getFollowers");
const GetFollowing = require("./routes/user/userList/getFollowing");
// POST FLOW
const GetUserPostFlow = require("./routes/postflow/getUserPostFlow");
const LikePost = require("./routes/post/likePost");
const SavePost = require("./routes/post/savePost");

// POST AUTH
app.post(postLink.signIn, SignIn);
app.post(postLink.signUp, SignUp);
// POST -USER
app.post(postLink.checkUsername, CheckUsername);
app.post(postLink.follow, Follow);
// POST - POST
app.post(postLink.likePost, LikePost);
app.post(postLink.savePost, SavePost);

// GET - USER
app.get(getLink.getUserData, GetUserData);
app.get(getLink.getUserFollowers, GetFollowers);
app.get(getLink.getUserFollowing, GetFollowing);
// GET - POST FLOW
app.get(getLink.getUserPostFlow, GetUserPostFlow);

const connectedUsers = new Map();

connectionToSocket(io, connectedUsers);

const listener = server.listen(8055 || process.env.PORT, () => {
  console.log(`Server is running on port ${listener.address().port}`);
});
