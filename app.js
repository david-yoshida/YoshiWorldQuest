/*!
 * Scooter the game
 * Protector of the realms the game
 *
 * Copyright(c) 2015 David Yoshida
 */

// Modules
var express = require('express');
var bodyParser = require('body-parser');

// Import User Defined Classes
require('./modules/utils.js');
var Person = require('./modules/person.js');
var Gameboard = require('./modules/gameboard.js');

// Start Webserver
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public')); // Folder For static / content

var server = require('http').createServer(app)
server.listen(3000, function () {
    
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);

});


GLOBAL.io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    
    console.log('socket.io - connection!');

    socket.on('send message', function (data) {

        io.sockets.emit('new message', data);       //io.broadcast.emit('new message', data); do not send to self.
        console.log('socket.io - send message!' + data);
    });
});












/**
 *  WEB SERVICE CALLS
 */

// HANDLE PERSON MOVEMENT REQUEST
app.post('/move', function (req, res) {
    
    var theDirection    = req.body.direction;
    var personID        = req.body.personID;
    var icon            = req.body.icon;
    var str;
    
    personArray[personID].icon = icon;                         // TO DO: allow change of clothes or appearance when equipment is used  TODO: clean up the use of GLOBAL in the classes.
    personArray[personID].movement(theDirection);                // TO DO : Cleann up the use the GLOBAL in the classes, find a pattern for this on google search

    str = personArray[personID].parseLocationToJSON();
    
    //console.log('firstName: ' + personArray[personID].firstName + ' ID: ' + personID + ' str: ' + str);

    // Write to browser
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(str);

});

// NEW PLAYER REQUEST
app.post('/newGame', function (req, res) {
    
    var person1 = new Person(req.body.name, req.body.icon); // get name from post
    
    gameboard1.addPerson(person1);  // Add new person to the game boards
    //person1.emitMovement();         // Emit new person to all users
    
    gameboard1.broadcastRefresh(); // TO DO: EMIT TO ONLY THE NEW GAME PLAYER
    gameboard1.broadcastAI();// TODO: Monster AI for movement, or re-assess some stuff when new player arrives
    
    // TODO : add people to different game boards.
    
    var str;

    str = person1.parseLocationToJSON();

    // Write to browser
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(str);

    //console.log(JSON.stringify(personArray));
    

});



/**
*  CREATE FIRST GAMEBOARD - TODO :  LOAD FROM FILE OR SOMETHING
*  
*           #homestead
*/
function createGameboard1() {

    // New Gameboard
    var gb = new Gameboard('#homestead', GLOBAL_SECTION_SIZE_X * 2, GLOBAL_SECTION_SIZE_Y * 2); // row, col  game board size must be in multiples

    // add to master gameboard array
    gameboardArray["#homestead"] = gb;

    // ADD: fixed object to gameboard, like a wall
    for (var i = 0; i <= 23; i++) {
        gb.addPersonFixed(new Person('Wall', 'object-wall1'), 0, i);
    }

    // ADD: The jump point
    gb.addPersonFixed(new Person('wormhole', 'object-ladder'), 7, 7); 
    gb.addTeleportPoint("#desert", "object-ladder", 7,7, 15,15);  // teleport to #desert gameboard



    gb.addPersonFixed(new Person('Treasure', 'treasure'), 2, 22);  // add random tree;




    // ADD: random treasure box
    var Treasure1 = new Person('Treasure', 'treasure');
    gb.addPerson(Treasure1);  // Person and object are treated the same, so the client.html does not crash during a draw();

    // add manual tree
    gb.gameBoardArray[3][3] = Treasure1;  // Add Treasure placeholder to the game board manually


    // add random trees
    var tree1;
    var totalTrees = 20; //10
    // Add random trees
    for (var s = 0; s < totalTrees; s++) {
        tree1 = new Person('Tree', 'tile-tree1');
        gb.addPerson(tree1);  // add random tree;

    }

    // add random campfire
    var campfire1 = new Person('Campfire', 'object-campfire');
    gb.addPerson(campfire1);


    return gb;
}




/**
*  CREATE SECOND GAMEBOARD
*  
*           #desert
*/

function createGameboard2() {

    // New Gameboard
    var gb = new Gameboard('#desert', GLOBAL_SECTION_SIZE_X * 3, GLOBAL_SECTION_SIZE_Y * 3);

    // add to master gameboard array
    gameboardArray["#desert"] = gb;


    // Jump point
    gb.addPersonFixed(new Person('wormhole', 'object-ladder'), 7, 7);
    gb.addTeleportPoint("#homestead", "object-ladder", 7, 7, 15, 15);  // teleport to #desert gameboard


    // ADD: fixed object to gameboard, like a wall
    for (var i = 0; i <= GLOBAL_SECTION_SIZE_Y * 3; i++) {
        gb.addPersonFixed(new Person('Wall', 'object-wall1'), 0, i);    // top wall
        gb.addPersonFixed(new Person('Wall', 'object-wall1'), 23, i);   // bottom wall
        //gb.addPersonFixed(new Person('Wall', 'object-wall1'), i, 0);    // west wall
        //gb.addPersonFixed(new Person('Wall', 'object-wall1'), i, 23);   // east wall
    }


    // ADD: fixed object to gameboard, like a wall
    for (var i = 1; i <= GLOBAL_SECTION_SIZE_Y * 3 - 1; i++) {
        gb.addPersonFixed(new Person('Wall', 'object-wall1'), i, 0);    // west wall
        gb.addPersonFixed(new Person('Wall', 'object-wall1'), i, 35);   // east wall
    }


    // Add random trees
    for (var s = 0; s < 30; s++) {
        // add random campfire
        var campfire2 = new Person('Campfire', 'object-campfire');
        gb.addPerson(campfire2);

    }



    return gb;
}








/**
 *  MAIN SETUP HERE
 */
GLOBAL.personArray = new Array(0);
GLOBAL.personIDcounter = 0;

GLOBAL.gameboardArray = new Array(0);

GLOBAL.GLOBAL_SECTION_SIZE_X        = 8;
GLOBAL.GLOBAL_SECTION_SIZE_Y        = 12;


var gameboard1 = createGameboard1();  // #homestead
var gameboard2 = createGameboard2();  // #desert

