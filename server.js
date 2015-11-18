var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

mongoose = require('mongoose');

var port = parseInt(process.env.PORT) || 901;

var dbURI = 'mongodb://mmalkav:phoenix11@ds047114.mongolab.com:47114/heroku_tm8m3hgj';

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
require('middleware/mongooseModels.js')(app, mongoose);

regionsSchema = mongoose.model('regions', regionModel.region);
region_ownersSchema = mongoose.model('region_owners', regionModel.region_owners);
userSchema = mongoose.model('users', chatAccount);

var server = app.listen(port || 901, function() {
    console.log("listening on " + port);
});

var io  = require('socket.io').listen(server);

io.sockets.on('connection', function (client) {
    client.on('message', function (message) {
        try {
            client.emit('message', message);
            client.broadcast.emit('message', message);
        } catch (e) {
            console.log(e);
            client.disconnect();
        }
    });
});