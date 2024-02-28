const SpotifyPlay = (req, res, spotifyApi) => {
  const { uri } = req.query;
  spotifyApi
    .play({ uris: [uri] })
    .then(() => {
      res.send("playing started");
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

module.exports = SpotifyPlay;
