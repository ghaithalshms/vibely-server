const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const {
  postLink,
  getLink,
  deleteLink,
  putLink,
  updateLink,
} = require("./API_LINK");

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
const SignIn = require("./routes/auth/signIn");
const SignUp = require("./routes/auth/signUp");
const CheckUsername = require("./routes/user/checkUsername");
const GetUserData = require("./routes/user/getUserData");
const Follow = require("./routes/user/follow");
const GetFollowers = require("./routes/user/userList/getFollowers");
const GetFollowing = require("./routes/user/userList/getFollowing");
const GetUserPostFlow = require("./routes/postFlow/getUserPostFlow");
const LikePost = require("./routes/post/likePost");
const SavePost = require("./routes/post/savePost");
const GetPostComments = require("./routes/post/getPostComments");
const LikeComment = require("./routes/comment/likeComment");
const CreateComment = require("./routes/comment/createComment");
const DeleteComment = require("./routes/comment/deleteComment");
const GetPostLikedUsers = require("./routes/post/userList/getPostLikedUsers");
const DeletePost = require("./routes/post/deletePost");
const ArchivePost = require("./routes/post/archivePost");
const GetHomePostFlow = require("./routes/postFlow/getHomePostFlow");
const GetExplorerPostFlow = require("./routes/postFlow/getExplorerPostFlow");
const GetUserPicture = require("./routes/user/getUserPicture");
const CreatePost = require("./routes/post/createPost");
const multer = require("multer");
const GetSearchUser = require("./routes/search/getSearchUser");
const GetLikedPostFlow = require("./routes/postFlow/getLikedPostFlow");
const GetSavedPostFlow = require("./routes/postFlow/getSavedPostFlow");
const GetArchivedPostFlow = require("./routes/postFlow/getArchivedPostFlow");

// *********** POST ***********
// activate server
app.get(getLink.activateServer, (req, res) => {
  res.status(200).json("hey");
});
// AUTH
app.post(postLink.signIn, SignIn);
app.post(postLink.signUp, SignUp);
// USER
app.post(postLink.checkUsername, CheckUsername);
app.post(postLink.follow, Follow);
// POST
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.post(postLink.createPost, upload.single("file"), CreatePost);
app.post(postLink.likePost, LikePost);
app.post(postLink.savePost, SavePost);
// COMMENT
app.post(postLink.likeComment, LikeComment);
app.post(postLink.createComment, CreateComment);

// *********** GET ***********
// USER
app.get(getLink.getUserData, GetUserData);
app.get(getLink.getUserFollowers, GetFollowers);
app.get(getLink.getUserFollowing, GetFollowing);
app.get(getLink.getUserPicture, GetUserPicture);
app.get(getLink.getSearchUser, GetSearchUser);
// POST FLOW
app.get(getLink.getUserPostFlow, GetUserPostFlow);
app.get(getLink.getHomePostFlow, GetHomePostFlow);
app.get(getLink.getExplorerPostFlow, GetExplorerPostFlow);
app.get(getLink.getLikedPostFlow, GetLikedPostFlow);
app.get(getLink.getSavedPostFlow, GetSavedPostFlow);
app.get(getLink.getArchivedPostFlow, GetArchivedPostFlow);
// POST
app.get(getLink.getPostComments, GetPostComments);
app.get(getLink.getPostLikedUsers, GetPostLikedUsers);

// *********** DELETE ***********
// POST
app.post(deleteLink.deletePost, DeletePost);
// COMMENT
app.post(deleteLink.deleteComment, DeleteComment);

// *********** UPDATE ***********
// POST
app.post(updateLink.archivePost, ArchivePost);

const connectedUsers = new Map();

connectionToSocket(io, connectedUsers);

const listener = server.listen(8055 || process.env.PORT, () => {
  console.log(`Server is running on port ${listener.address().port}`);
});
