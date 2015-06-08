/*!
 * YoshiQuest
 * Copyright(c) 2015 David Yoshida
 */

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public')); //and then the url localhost:8080/images/logo.gif should work

var server = require('http').createServer(app)
server.listen(3000, function () {
    
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);

});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    
    console.log('socket.io - connection!');

    socket.on('send message', function (data) {

        io.sockets.emit('new message', data);       //io.broadcast.emit('new message', data); do not send to self.
        console.log('socket.io - send message!' + data);
    });
});


/**
 *      GAMEBOARD CLASS START
 */
var Gameboard = function (hashtag, row, col) {
    
    this.hashtag    = hashtag;
    this.maxRow     = row - 1;
    this.maxCol     = col - 1;
    
    // Create global gameboard array
    this.gameBoardArray;
    this.gameBoardArray = new Array(row)

    for (i = 0; i < col; i++)
        this.gameBoardArray[i] = new Array(row);

    console.log('Gameboard instantiated ' + this.hashtag);
}

Gameboard.prototype.addPerson = function (person) {

    var success = false;
    person.xPos = 0;
    person.yPos = 0;
    person.currentGameboard = this;  // bind new person to this particular gameboard

    // RANDOM placement of new person
    var xRnd, yRnd;

    for (var i = 0; i < (this.maxRow * this.maxCol) ; i++) {

        xRnd = Math.floor(Math.random() * (this.maxRow + 1)) + 0;    // i.e. 1-8
        yRnd = Math.floor(Math.random() * (this.maxCol + 1)) + 0;      // i.e. 1- 10

        // Check for free space
        if (this.gameBoardArray[xRnd][yRnd] != null) {
                // something here!
        } else {

            this.gameBoardArray[xRnd][yRnd] = person; // update start position on game board
            person.xPos = xRnd;
            person.yPos = yRnd;
            person.refreshSection();// Refresh the section co-ordinates they are in.
            success = true;

            console.log("Welcome to the gameboard " + this.gameBoardArray[person.xPos][person.yPos].firstName + '| ID:' + this.gameBoardArray[person.xPos][person.yPos].id + '| (' + person.xPos + ',' + person.yPos + ')' + '  Grid:(' + person.xSectionStart + ',' + person.ySectionStart + ')' );
            break;
        }
    } // end for
    
    
    if (!success) {
        console.log("ERROR: " + person.firstName + " not added to gameboard");
    }

};

Gameboard.prototype.addPersonFixed = function (person, x, y) {
    
    person.xPos = x;
    person.yPos = y;
    person.currentGameboard = this;  // bind new person to this particular gameboard
    person.refreshSection();// Refresh the section co-ordinates they are in.

    this.gameBoardArray[x][y] = person; // put person/object on the gameboard spot!

};


Gameboard.prototype.broadcastRefresh = function (person) {
    
    // Call redraw for the whole gameboard
    for (i = 0; i < personArray.length; i++) {
        if (personArray[i] != null) personArray[i].emitMovement(); // skip blank
    }
};


Gameboard.prototype.broadcastAI = function (person) {
    
    // Call redraw for the whole gameboard
    for (i = 0; i < personArray.length; i++) {
        
        // only move monstor
        if (personArray[i] != null && personArray[i].icon == 'monster-banana') {
            personArray[i].movement('down'); // skip blank
        }

    }
};



// GAMEBOARD CLASS END







/**
 *      PERSON CLASS START
 */
var Person = function (firstName, icon) {

    this.id = this.getNextid();
    this.salt = this.generateSalt(); // use this for a simple sessionID check
    this.firstName = firstName;
    this.icon = icon;
    this.face = 'E'; // S - South by default
    this.xPos;
    this.yPos;
    this.xSectionStart;
    this.ySectionStart; 
    this.createdDate = Date.now();
    this.currentGameboard;
    
    console.log('Person instantiated. ' + personArray.push(this) + ' people.');  // Add to the global personArray;
};

Person.prototype.movement = function (action) {

    var xPos = this.xPos; // assign global to local variable
    var yPos = this.yPos; // assign global to local variable
    var face = this.face;

    switch (action) {
        case "up":
            xPos--;
            face = 'fN';
            break;
        case "down":
            xPos++;
            face = 'fS';
            break;
        case "left":
            yPos--;
            face = 'fW';          
            break;
        case "right":
            yPos++;
            face = 'fE';
            break;
        default:
    }

    if (false) {   // World wrap
        if (xPos < 0) xPos = this.currentGameboard.maxRow;
        if (xPos > this.currentGameboard.maxRow) xPos = 0;
        if (yPos < 0) yPos = this.currentGameboard.maxCol;
        if (yPos > this.currentGameboard.maxCol) yPos = 0;

    } else { // no world wrap
        if (xPos < 0) xPos = 0;
        if (xPos > this.currentGameboard.maxRow) xPos = this.currentGameboard.maxRow;
        if (yPos < 1) yPos = 0;
        if (yPos > this.currentGameboard.maxCol) yPos = this.currentGameboard.maxCol;
    }

    
    if (this.currentGameboard.gameBoardArray[xPos][yPos] != null) {
        console.log("Blocked:Something here!");
        
        
        // Kill the bannana, as long as you are not the bananna
        if (this.icon != "monster-banana" && this.currentGameboard.gameBoardArray[xPos][yPos].icon == "monster-banana") {
            
            console.log(this.firstName + " ate the Bannana!");
            
            var monster1 = this.currentGameboard.gameBoardArray[xPos][yPos]; // grab the monster
            
            var strEmit = '{ "id": ' + monster1.id + 
                ',"firstName": "' + monster1.firstName + 
                '","icon": "' + monster1.icon + 
                '", "xPos": ' + monster1.xPos + 
                ', "yPos": ' + monster1.yPos + 
                ' }';
            
            io.sockets.emit('remove person', strEmit);                  // broadcast remove person
            delete personArray[monster1.id];                            // delete from person array, but keep stucture. TO DO:  issue person array keeps growing, never get's smaller
            delete this.currentGameboard.gameBoardArray[xPos][yPos];    // delete from game board
        }

    } else {

        delete this.currentGameboard.gameBoardArray[this.xPos][this.yPos];  // remove person from old position

        this.xPos = xPos; // assign to new position
        this.yPos = yPos; // assign to new position
        this.face = face;
        this.refreshSection();// Refresh the section co-ordinates person is in now
    
        this.currentGameboard.gameBoardArray[this.xPos][this.yPos] = this;  // add person to new position
    }
    
    
    // TELEPORT CODE
    if (false) {
        if (this.xPos == 3 && this.yPos == 0 && this.currentGameboard.hashtag == '#homestead') {
        
            delete this.currentGameboard.gameBoardArray[this.xPos][this.yPos];
            gameboard2.addPersonFixed(this, 2,2); // try to jump person to a fixed position first

            console.log('Jump Point here!: ' + ''); // xxx

        }
    }



    console.log('Move: ' + this.firstName + ' (' + this.xPos + '-' + this.yPos + ')');
    
    this.emitMovement(); // Send movement to all players

}


// Refresh the gameboard section person is on
Person.prototype.refreshSection = function () {
    
    if(true){
        this.xSectionStart = Math.floor(this.xPos / GLOBAL_SECTION_SIZE_X) * GLOBAL_SECTION_SIZE_X;
        this.ySectionStart = Math.floor(this.yPos / GLOBAL_SECTION_SIZE_Y) * GLOBAL_SECTION_SIZE_Y;
    } else {
    
    //TODO:  Try to put section start points 1 at a time instead of 8.  You will get a scrolling effect
        this.xSectionStart = Math.floor(this.xPos / GLOBAL_SECTION_SIZE_X);
        this.ySectionStart = Math.floor(this.yPos / GLOBAL_SECTION_SIZE_Y);
    }


}

// Get Next Person ID
Person.prototype.getNextid = function () {

    var nextID = personIDcounter;

    personIDcounter++;

    return nextID;
}

Person.prototype.generateSalt = function () {
    
    return 'salt';
}

Person.prototype.emitMovement = function () {
    
    io.sockets.emit('new movement', this.parseLocationToJSON());  // use the parseLocationToJSON to send peson object to client
}

Person.prototype.parseLocationToJSON = function () {
    
    
    // TODO: make string smaller by using smaller field names.

    var str = '{ "id": ' + this.id + 
                ', "firstName": "' + this.firstName + 
                '", "icon": "' + this.icon + 
                '", "face": "' + this.face +
                '", "gbName": "' + this.currentGameboard.hashtag + 
                '", "xPos": ' + this.xPos + 
                ', "yPos": ' + this.yPos + 
                ', "xGBSector": ' + this.xSectionStart + 
                ', "yGBSector": ' + this.ySectionStart + 
                ' }';  // i.e. var str = '{ "name": "John Doe", "age": 42 }';

    return str;
}
// PERSON CLASS END











/**
 *  WEB SERVICE CALLS
 */

// HANDLE PERSON MOVEMENT REQUEST
app.post('/move', function (req, res) {
    
    var theDirection    = req.body.direction;
    var personID        = req.body.personID;
    var icon            = req.body.icon;
    var str;
    
    personArray[personID].icon = icon;                      // TO DO: allow change of clothes or appearance when equipment is used
    personArray[personID].movement(theDirection);

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
 *  HANDY FUNCTIONS
 */
// Check if NPC exists, if so return person Id
function findInArray(myArray, id) {
    
    var personExists = -1;
    
    for (i = 0; i < myArray.length; i++) {
        if (myArray[i].id == id) personExists = i; // found id!
    }
    
    return personExists;
}





/**
 *  MAIN SETUP HERE
 */

var personArray = new Array(0);
var personIDcounter = 0;

var GLOBAL_SECTION_SIZE_X = 8;
var GLOBAL_SECTION_SIZE_Y = 12;


/**
 *  CREATE FIRST GAMEBOARD - TODO :  LOAD FROM FILE OR SOMETHING
 *  
 *  homestead
 */

var gameboard1 = new Gameboard('#homestead', GLOBAL_SECTION_SIZE_X * 1, GLOBAL_SECTION_SIZE_Y * 2); // row, col  game board size must be in multiples

// ADD: fixed object to gameboard, like a wall
for (var i = 0; i <= 23; i++) {
    gameboard1.addPersonFixed(new Person('Wall', 'object-wall1'), 0, i);  // add random tree;
}

gameboard1.addPersonFixed(new Person('Treasure', 'treasure'), 2, 22);  // add random tree;


// ADD: random treasure box
var Treasure1 = new Person('Treasure', 'treasure');
gameboard1.addPerson(Treasure1);  // Person and object are treated the same, so the client.html does not crash during a draw();

// add placeholder
gameboard1.gameBoardArray[3][3] = Treasure1;  // Add Treasure placeholder to the game board
gameboard1.gameBoardArray[7][7] = Treasure1;  // Add Treasure placeholder to the game board


// add random trees
var tree1;
var totalTrees = 20; //10
// Add random trees
for (var s = 0; s < totalTrees; s++) {
    tree1 = new Person('Tree', 'tile-tree1');
    gameboard1.addPerson(tree1);  // add random tree;

}

// add random campfire
var campfire1 = new Person('Campfire', 'object-campfire');
gameboard1.addPerson(campfire1);

/**
 *  CREATE SECOND GAMEBOARD
 *  
 *  #desert  DY
 */
var gameboard2 = new Gameboard('#desert', GLOBAL_SECTION_SIZE_X * 1, GLOBAL_SECTION_SIZE_Y * 2);

// Add random trees
for (var s = 0; s < 30; s++) {
    tree1 = new Person('Tree', 'tile-tree1');
    gameboard2.addPerson(tree1);  // add random tree;

}

// add random campfire
var campfire2 = new Person('Campfire', 'object-campfire');
gameboard2.addPerson(campfire2);
