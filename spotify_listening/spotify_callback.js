const SpotifyCallback = (req, res, spotifyApi) => {
  const { error, code, state } = req.query;
  if (error) {
    console.log(error);
    res.send(error);
    return;
  }
  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const { access_token, refresh_token, expires_in } = data.body;

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      console.log(access_token, refresh_token);
      res.send("success");

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const { access_token } = data.body;
        spotifyApi.setAccessToken(access_token);
      }, (expires_in / 2) * 1000);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

module.exports = SpotifyCallback;
