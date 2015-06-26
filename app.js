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
var MonsterManual = require('./modules/MonsterManual.js');
var ItemManual = require('./modules/ItemManual.js');
var Gameboard = require('./modules/gameboard.js');
var GameClock = require('./modules/gameclock.js');

// Start Webserver
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public')); // Folder For static / content

// Create Monster manaul

var mm = new MonsterManual();
var im = new ItemManual();

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
    var tempGUID        = req.body.gsInstance
    var str;
    

    // Be sure game reset did not happen
    if (gameServerInstanceGUID == tempGUID)
    {
        personArray[personID].icon = icon;                         // TO DO: allow change of clothes or appearance when equipment is used
        personArray[personID].movement(theDirection);              // TO DO : Cleann up the use the GLOBAL in the classes, find a pattern for this on google search
        str = personArray[personID].parseLocationToJSON();

    }
    else { // detect game reset, send back the current game server instance to browser
        str = '{ "gsInstance": ' + this.gameServerInstanceGUID + ' }';
    }
        
    // Write to browser
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(str);
    
    // After each movement call the gameTick() to advance various server side game elements derrived from turn based gaming
    if (gameServerInstanceGUID == tempGUID)
        gameTick();

    // DEBUG : console.log('firstName: ' + personArray[personID].firstName + ' ID: ' + personID + ' str: ' + str);

});

// NEW PLAYER REQUEST
app.post('/newGame', function (req, res) {
    
    var person1 = new Person(req.body.name, req.body.icon); // get name from post
    person1.isPlayer = true;

    gameboard1.addPerson(person1);  // Add new person to the game boards
    gameboard1.refreshPlayerCount();

    //person1.emitMovement();         // Emit new person to all users
    
    gameboard1.broadcastRefresh(); // TO DO: EMIT TO ONLY THE NEW GAME PLAYER
    
    // TODO: re-assess some stuff when new player arrives
    // TODO: add people to different game boards.
    
    var str;

    str = person1.parseLocationToJSON();

    // Write to browser
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(str);

    //console.log(JSON.stringify(personArray));

});

/* 
 * PLAYER - change action mode
 * 
 *      normal
 *      attack
 *      quiet
 *      flee
 *      rest
 *      
 */
app.post('/mode', function (req, res) {
    
    var mode = req.body.mode;
    var personID = req.body.personID;
    
    personArray[personID].mode = mode;
    
    // Adjust speed
    switch (mode) {
        case "normal":
            personArray[personID].movementRate = personArray[personID].baseMovementRate;  // Default 170
            break;
        case "attack":
            personArray[personID].movementRate = personArray[personID].baseMovementRate * 4;  // X 4
            break;
        case "quiet":
            personArray[personID].movementRate = personArray[personID].baseMovementRate * 8;   // X 8
            break;
        case "flee":
            personArray[personID].movementRate = personArray[personID].baseMovementRate - 10; // 10 ticks faster
            break;
        case "rest":
            personArray[personID].movementRate = personArray[personID].baseMovementRate * 1000; // Cannot move, may have to up this number
            break;
        default:
    }

    personArray[personID].tickCounter = Date.now() - personArray[personID].movementRate; // reset tick counter on mode change, so person has to wait their new movement rate

    var str = '{ "id": '+ personID + 
                ', "mode": "' + mode +  
                '", "movementRate": ' + personArray[personID].movementRate +  
                ' }';

    // Write to browser
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(str);

    //console.log(str + ' tick' + (Date.now() - personArray[personID].tickCounter));

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
    
    
    // Create a monster
    p = new Person('Enemy', 'monster-mount1');
    p.setAsMonster();
    gb.addPersonFixed(p, 4, 4);
    

    // Create some monsters
    gb.addPersonFixed(mm.createKnight(), 5, 5);
    gb.addPersonFixed(mm.createCrow(), 6, 6);
    
    for (var aa = 0; aa < 4; aa++) {

        gb.addPerson(mm.createKnight());  

    }
    
    for (var aa = 0; aa < 2; aa++) {

        gb.addPerson(mm.createCrow());

    }



    // ADD: fixed object to gameboard, like a wall
    for (var i = 0; i <= 23; i++) {
        gb.addPersonFixed(new Person('Wall', 'object-wall1'), 0, i);
    }

    // ADD: The jump point
    gb.addPersonFixed(new Person('wormhole', 'object-ladder'), 7, 7); 
    gb.addTeleportPoint("#desert", "object-ladder", 7,7, 15,15);  // teleport to #desert gameboard


    gb.addPersonFixed(im.createWoodenBox(), 2, 22); // add fixed wooden box;
    gb.addPerson(im.createWoodenBox());             // random position wooden box;



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

   

    // Add jump point
    gb.addPersonFixed(new Person('wormhole', 'object-ladder'), 7, 7);
    gb.addTeleportPoint("#homestead", "object-ladder", 7, 7, 15, 15);  // teleport to #desert gameboard


    // Create Fixed position wall
    for (var i = 0; i <= GLOBAL_SECTION_SIZE_Y * 3; i++) {
        gb.addPersonFixed(new Person('Wall', 'object-wall1'), 0, i);    // top wall
        gb.addPersonFixed(new Person('Wall', 'object-wall1'), 23, i);   // bottom wall
    }

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

// call the game tick
function gameTick() {

    gc.helloWorld();
    // Step 1. Move monste
    gc.moveMonsters(personArray);  // TODO:  gc.moveMonster(gameboardHashtag) to move the monsters on a particular gameboard.


    // Step 2. Attack or Spells


    // Other system clean up? spawn


}



/**
 *  MAIN SETUP HERE
 */
GLOBAL.personArray = new Array(0);
GLOBAL.personIDcounter = 0;

GLOBAL.gameboardArray = new Array(0);

GLOBAL.GLOBAL_SECTION_SIZE_X        = 8;
GLOBAL.GLOBAL_SECTION_SIZE_Y = 12;

GLOBAL.gameServerInstanceGUID = Date.now(); //Determine the game instance



var gameboard1 = createGameboard1();  // #homestead
var gameboard2 = createGameboard2();  // #desert


var gc = new GameClock(); // Create the game clock

