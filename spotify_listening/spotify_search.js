const SpotifySearch = (req, res, spotifyApi) => {
  const { q } = req.query;

  spotifyApi
    .searchTracks(q)
    .then((searchData) => {
      const trackUri = searchData.body.tracks.items[0].uri;
      res.send({ uri: trackUri });
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
};

module.exports = SpotifySearch;
