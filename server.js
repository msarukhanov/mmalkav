var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/data'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/favicon.ico', express.static('./data/favicon.ico'));

app.set('json spaces', 2);

require('middleware/routes.js')(app, fs);

var server = app.listen(901);
