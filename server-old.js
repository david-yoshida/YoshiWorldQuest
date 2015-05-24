var http = require('http');
var port = process.env.port || 1337;

var serverCounter = 1;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin':'*' });
    
    serverCounter++;
    

    res.end(serverCounter + '\n' + Date.now());
    
    // my comment
}).listen(port);




console.log('Server running at http://127.0.0.1:1337/' + Date.now());