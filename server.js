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

var usernames = {};
var numUsers = 0;
var users = io.sockets;

io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('new message', function (data) {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    socket.on('add user', function (username) {
        socket.username = username;
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers,
            listUsers : usernames
        });
        socket.broadcast.emit('user joined', {
            username: socket.username,
            listUsers : usernames,
            numUsers: numUsers
        });
    });

    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('disconnect', function () {
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers,
                listUsers : usernames
            });
        }
    });
});
