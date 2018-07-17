var express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
    SpotifyWebApi = require('spotify-web-api-node'),
    billboard     = require("billboard-top-100").getChart,
    listCharts    = require('billboard-top-100').listCharts,
    clientID      = process.env.ID,
    clientSecret  = process.env.SECRET,
    token,
    date;

    
    
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", function(req, res){
  init();
  res.render("index");
});

app.get('/token', function(req, res){
  console.log("token");
  console.log(token);
  res.send({"token": token});
});
 
app.get('/billboard', function(req, res){
  listCharts(function(data){
    console.log(data);
  }
  var dateString = req.query.date.toString();
  billboard('radio-songs', dateString, function(songs, err){
    if(err){
      console.log(err)
    } else {
      res.send(songs.slice(0, 10));
    }
  })
});


function init(){
  var spotifyApi = new SpotifyWebApi({
    clientId : clientID,
    clientSecret : clientSecret
  });
    
  // Retrieve an access token.
  spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      token = data.body['access_token'];
    
      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
      console.log('Something went wrong when retrieving an access token', err);
    }); 
}

app.listen(process.env.PORT, process.env.IP, function(){
});