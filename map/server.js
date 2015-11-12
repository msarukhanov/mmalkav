var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/data'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('json spaces', 2);

app.get('/', function (req, res) {
    fs.readFile('./map.html', function (err, html) {
        if (err) {
            throw err;
        }
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end();
    });
});

app.get('/getFactions', function (req, res) {
    fs.readFile('./data/json/factions.json', 'utf8', function (err, data) {
        res.type('application/json');
        res.jsonp(JSON.parse(data));
    });
});

app.get('/getCampaignInfo', function (req, res) {
    fs.readFile('./data/json/campaignInfo.json', 'utf8', function (err, data) {
        res.type('application/json');
        res.jsonp(JSON.parse(data));
    });
});

app.post('/setCampaignInfo', function (req, res) {
    fs.readFile('./data/json/campaignInfo.json', 'utf8', function (err, data) {
        var map = data;
        map = JSON.parse(map);
        map[req.body.id] = req.body.country;
        map = JSON.stringify(map, null, '\t');
        fs.writeFile('./data/json/campaignInfo.json', map, function (err, data) {
            if (err) {
                console.log(err.message);
                return;
            }
            else res.jsonp(JSON.parse(map));
        });
    });
});

var server = app.listen(901, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port)
});