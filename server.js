var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');

var port = parseInt(process.env.PORT) || 901;

var mongoHost = process.env.MONGOHOST || '54.197.231.236';
var dbURI = 'mongodb://'+mongoHost+':27017/app17594471';

mongoose.connect(dbURI);
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

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
