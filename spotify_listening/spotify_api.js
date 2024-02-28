const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOITFY_CLIENT_ID,
  clientSecret: process.env.SPOITFY_CLIENT_SECRET,
  redirectUri: process.env.SPOITFY_CALLBACK,
});

module.exports = spotifyApi;
