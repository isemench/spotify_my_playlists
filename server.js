module.exports = start

var utils = require('./utils.js')
var logs = require('./log.js')
var express = require('express')
var app = express();
var querystring = require('querystring')
var cookieParser = require('cookie-parser')
var request = require('request')
var ids = require('./spotify/spotify_data.js')

var scopes_next = 'playlist-read-collaborative';
var scopes = 'user-read-private user-read-email';
var stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/public')).use(cookieParser());

app.get('/login', function(req, res) {
    logs.info(">> Authorization request from user");
    var state = utils.randomString(16);
    res.cookie(stateKey, state);
    logs.info("<< Do authorization request to Spotify");
    res.redirect('https://accounts.spotify.com/authorize?'
        + querystring.stringify({
            client_id: ids.client,
            redirect_uri: ids.redirect_uri,
            response_type: 'code',
            scopes: scopes,
            state: state
        })
    );
});

app.get('/callback', function(req, res) {
    var state = req.query.state || null;
    var savedState = req.cookies ? req.cookies[stateKey] : null;
    var code = req.query.code || null;
    if (state == null || state != savedState) {
        logs.info(">> Authorization response from Spotify - state_mismatch");
        res.redirect('/#' + querystring.stringify({
            error: 'state_mismatch'
        }));
    }
    else {
        logs.info(">> Authorization response from Spotify - OK");
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: ids.redirect_uri
            },
            headers: {
                'Authorization': 'Basic ' + Buffer.from(ids.client + ':' + ids.secret).toString('base64')
            }
        };
        logs.info("<< Do token request to Spotify");
        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                logs.info(">> Token response from Spotify - OK ");
                var result = JSON.parse(body);
                var accessToken = result.access_token,
                    refreshToken = result.refresh_token;
                var userOptions = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                };
                logs.info("<< Do user information request to Spotify");
                request.get(userOptions, function(error, response, body) {
                    logs.info(">> User information response from Spotify");
                    logs.info(body);
                });
                res.redirect('/#' + querystring.stringify({
                    access_token: accessToken,
                    refresh_token: refreshToken
                }));
            }
            else {
                logs.info(">> Token response from Spotify - invalid_token");
                res.redirect('/#' + querystring.stringify({
                    error: 'invalid_token'
                }));
            }
        });
    }
})

function start() {
    app.listen(1900, function() {
        logs.info("Node Web server running on port 1900...");
    });
};
