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
        
        console.log('socket.io - send message!' + data);

        io.sockets.emit('new message', data);
        //io.broadcast.emit('new message', data); do not send to self.
    });
});


/**
 *      GAMEBOARD CLASS START
 */
var Gameboard = function (row, col) {
    this.maxRow = row - 1;
    this.maxCol = col - 1;
    
    // Create global array of gameboard
    this.gameBoardArray;
    
    this.gameBoardArray = new Array(row)
    for (i = 0; i < col; i++)
        this.gameBoardArray[i] = new Array(row);

    console.log('Gameboard instantiated');
}

Gameboard.prototype.addPerson = function (person) {

    person.xPos = 0;
    person.yPos = 0;
    person.currentGameboard = this;  // bind new person to this particular gameboard
    
    // Random placement of new person
    var xRnd, yRnd;

    for (i = 0; i < ( this.gameBoardArray.length * this.gameBoardArray[0].length); i++) {
        
        xRnd = Math.floor((Math.random() * this.gameBoardArray[0].length));     // X
        yRnd = Math.floor((Math.random() * this.gameBoardArray.length));  // Y
        
        // Check for free space
        if (this.gameBoardArray[xRnd][yRnd] != null) {
                // something here!
        } else {

            this.gameBoardArray[xRnd][yRnd] = person; // start position is 0,0
            person.xPos = xRnd;
            person.yPos = yRnd;
            break;
        }

    }

    //if (this.gameBoardArray[0][0] != null) console.log("Something here 2!");
    console.log("Welcome to the gameboard " + this.gameBoardArray[person.xPos][person.yPos].firstName + '|' + this.gameBoardArray[person.xPos][person.yPos].id + '|' + xRnd + '|' + yRnd);
};

Gameboard.prototype.broadcastRefresh = function (person) {
    
    // Call redraw for the whole gameboard
    for (i = 0; i < personArray.length; i++) {
        if (personArray[i] != null) personArray[i].emitMovement(); // skip blank
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
    this.xPos;
    this.yPos;
    this.currentGameboard;
    
    console.log('personArray length: ' + personArray.push(this));  // Add to the global personArray;
    console.log('Person instantiated');
};

Person.prototype.movement = function (action) {
    
    var xPos = this.xPos; // assign global to local variable
    var yPos = this.yPos; // assign global to local variable

    switch (action) {
        case "up":
            xPos -= 1;
            if (xPos < 1) xPos = 0;
            break;
        case "down":
            xPos += 1;
            if (xPos > this.currentGameboard.maxRow) xPos = this.currentGameboard.maxRow;
            break;
        case "left":
            yPos -= 1;
            if (yPos < 1) yPos = 0;
            break;
        case "right":
            yPos += 1;
            if (yPos > this.currentGameboard.maxCol) yPos = this.currentGameboard.maxCol;
            break;

        default:
    }
    
    if (this.currentGameboard.gameBoardArray[xPos][yPos] != null) {
        console.log("Blocked:Something here!");
        
        
        // Kill the bannana, as long as you are not the bananna
        if (this.icon != "monster-bananna" && this.currentGameboard.gameBoardArray[xPos][yPos].icon == "monster-bananna") {
            
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
    
        this.currentGameboard.gameBoardArray[this.xPos][this.yPos] = this;  // add person to new position
    }


    console.log('Move: ' + this.firstName + ' (' + this.xPos + '-' + this.yPos + ')');
    
    this.emitMovement(); // Send movement to all players

}

Person.prototype.getNextid = function () {
    var nextID = personIDcounter;
    personIDcounter += 1;
    
    console.log('nextID: ' + nextID);

    return nextID;
}

Person.prototype.generateSalt = function () {
    
    return 'salt';
}

Person.prototype.emitMovement = function () {
    
    var strEmit = '{ "id": ' + this.id + 
                ',"firstName": "' + this.firstName + 
                '","icon": "' + this.icon + 
                '", "xPos": ' + this.xPos + 
                ', "yPos": ' + this.yPos + 
                ' }';
    
    io.sockets.emit('new movement', strEmit);
}

Person.prototype.parseLocationToJSON = function () {
    
    var str = '{ "id": ' + this.id + 
                ',"firstName": "' + this.firstName + 
                '","icon": "' + this.icon + 
                '", "xPos": ' + this.xPos + 
                ', "yPos": ' + this.yPos + 
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
    
    personArray[personID].movement(theDirection);
    personArray[personID].icon = icon;                      // TO DO: allow change of clothes or appearance when equipment is used

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

    
    // TODO : add people to different game boards.
    
    var str;

    str = person1.parseLocationToJSON();

    // Write to browser
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(str);

});



/**
 *  HANDY FUNCTIONS
 */
// Check if NPC exists
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

var gameboard1 = new Gameboard(8, 12); // row, col

/*  Add default player
 * 
    var person1 = new Person('Naomi', 'naomi');
    gameboard1.addPerson(person1);  // Add Naomi to the game board
 */
var Treasure1 = new Person('Treasure');

gameboard1.gameBoardArray[3][3] = Treasure1;  // Add Treasure placeholder to the game board
gameboard1.gameBoardArray[7][7] = Treasure1;  // Add Treasure placeholder to the game board



