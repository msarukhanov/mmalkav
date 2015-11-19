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
//io.sockets.on('connection', function (client, socket) {
//
//    client.on('message', function (message) {
//        try {
//            client.emit('message', message);
//            client.broadcast.emit('message', message);
//        } catch (e) {
//            console.log(e);
//            client.disconnect();
//        }
//    });
//});
//io.on('connection', function (socket) {
//    socket.on('add user', function (username) {
//        // we store the username in the socket session for this client
//        socket.username = username;
//        // add the client's username to the global list
//        usernames[username] = username;
//        ++numUsers;
//        addedUser = true;
//        socket.emit('login', {
//            numUsers: numUsers
//        });
//        // echo globally (all clients) that a person has connected
//        socket.broadcast.emit('user joined', {
//            username: socket.username,
//            numUsers: numUsers
//        });
//    });
//    socket.on('disconnect', function () {
//        // remove the username from global usernames list
//        if (addedUser) {
//            delete usernames[socket.username];
//            --numUsers;
//
//            // echo globally that this client has left
//            socket.broadcast.emit('user left', {
//                username: socket.username,
//                numUsers: numUsers
//            });
//        }
//    });
//});

var usernames = {};
var numUsers = 0;
var users = io.sockets;
//if(users.sockets[0]) console.log(users.sockets);
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
        if(users.sockets[0]) console.log(users.sockets);
        var user_list = [];
        for(var i=0;i<users.sockets.length; i++) {
            if(users.sockets[i].username) user_list.push(users.sockets[i].username);
        }
        console.log(user_list);
        socket.emit('refresh userlist', {
            userlist: user_list
        });
        socket.broadcast.emit('refresh userlist', {
            userlist: user_list
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

    socket.on('users online', function () {
        socket.broadcast.emit('update users', {
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
