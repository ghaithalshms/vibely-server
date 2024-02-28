const SpotifyLogin = (req, res, spotifyApi) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-read-playback-state",
    "user-modify-playback-state",
  ];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
};

module.exports = SpotifyLogin;
