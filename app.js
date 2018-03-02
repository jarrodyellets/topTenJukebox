var express = require("express"),
    app     = express(),
    SpotifyWebApi = require('spotify-web-api-node'),
    clientID = process.env.ID,
    clientSecret = process.env.SECRET,
    token;

    
    
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

init();

app.get("/", function(req, res){
    res.render("index");
});

app.get('/token', function(req, res){
  res.send({"token": token});
 });

function init(){
    var spotifyApi = new SpotifyWebApi({
    clientId : clientID,
    clientSecret : clientSecret
    });
     
    // Retrieve an access token.
    spotifyApi.clientCredentialsGrant()
      .then(function(data) {
        token = data.body['access_token'];
     
        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
      }, function(err) {
            console.log('Something went wrong when retrieving an access token', err);
      }); 
}

app.listen(process.env.PORT, process.env.IP, function(){
});