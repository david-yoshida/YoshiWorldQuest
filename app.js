var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));


var serverCounter = 1; // Server var.


// Don't forget get an post are different
app.post('/', function (req, res) {
    
    
    var myDirection = req.body.direction;
    
    serverCounter++;
    
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });

  res.end(myDirection +serverCounter +  '\n' + Date.now());
});

var server = app.listen(1337, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
