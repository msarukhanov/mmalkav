var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/data'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
//
//path.join(process.cwd(), 'index.html')
//
//path.join(process.cwd(), 'data/favicon.ico')

app.use('/favicon.ico', express.static('./data/favicon.ico'));

app.set('json spaces', 2);

require('middleware/routes.js')(app, fs);

var server = app.listen(process.env.PORT || 901, function() {
    console.log("listening on " + process.env.PORT);
});
