/**
 *      Gameboard Class defined
 *
 *      gameboard.js
 */
 var Gameboard = function (hashtag, row, col) {


 	personArray = GLOBAL.personArray;
    
    this.hashtag    = hashtag;
    this.maxRow     = row - 1;
    this.maxCol = col - 1;    
    
    // Create gameboard array
    this.gameBoardArray = new Array(row)

    for (i = 0; i < col; i++)
        this.gameBoardArray[i] = new Array(row);
    
    // Create action array - store teleports
    this.actionArray = new Array(row);
    for (i = 0; i < col; i++)
        this.actionArray[i] = new Array(row);
    


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


// create teleport jump points on this gameboard
Gameboard.prototype.addTeleportPoint = function (gb_hashtag, icon, xPos, yPos, to_xPos, to_yPos) {
    
    var teleportItem = {
        actionName: "teleport",
        to_hashtag: gb_hashtag,
        icon: icon,
        to_xPos : to_xPos,
        to_yPos : to_yPos
    };
    
    this.actionArray[xPos][yPos] = teleportItem;

};


// When a play moves into a square, check for a special action like teleport.
Gameboard.prototype.checkSpecialAction = function (person, xPos, yPos) {

    // Check for special action
    if (this.actionArray[xPos][yPos] != null) {
            
        act = this.actionArray[xPos][yPos];

        if (act.actionName == 'teleport'){  // jump code here.

            delete this.gameBoardArray[person.xPos][person.yPos];
            gameboardArray[act.to_hashtag].addPersonFixed(person, act.to_xPos, act.to_yPos); // try to jump person to a fixed position first
            console.log('Perform Teleport!: ' + ''); 
        }

    }


};



module.exports = Gameboard;