var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

var port = parseInt(process.env.PORT) || 901;

app.use(express.static(__dirname + '/data'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/favicon.ico', express.static('./data/favicon.ico'));

app.set('json spaces', 2);

require('middleware/routes.js')(app, fs);

var server = app.listen(port || 901, function() {
    console.log("listening on " + port);
});
