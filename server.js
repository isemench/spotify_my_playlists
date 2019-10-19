module.exports = start

var logs = require('./log.js')
var express = require('express')
var app = express();
var querystring = require('querystring')

var ids = require('./spotify/spotify_data.js')

app.use(express.static(__dirname + '/public'));

app.get('/login', function(req, res) {
    logs.info("Got Spotify login request");
    res.redirect('https://accounts.spotify.com/authorize?'
        + querystring.stringify({
            client_id: ids.client,
            redirect_uri: ids.redirect_uri,
            response_type: 'code'
        })
    );
});

app.get('/callback', function(req, res) {
    logs.info("Got response from Spotify authorization, code: " + req.query.code);

})

function start() {
    app.listen(1900, function() {
        logs.info("Node Web server running on port 1900...");
    });
};
