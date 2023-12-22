const signIn = require("./routes/auth/signIn");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const { postLink, getLink, deleteLink, updateLink } = require("./API_LINK");

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

// IMPORT ROUTES
// AUTH
const SignIn = require("./routes/auth/signIn");
const SignUp = require("./routes/auth/signUp");

// APP AUTH
app.post(postLink.signIn, SignIn);
app.post(postLink.signUp, SignUp);

const connectedUsers = new Map();

const listener = server.listen(8055 || process.env.PORT, () => {
  console.log(`Server is running on port ${listener.address().port}`);
});
