/**
 *      PERSON Class Defined
 *
 *      person.js
 */

var Person = function (firstName, icon) {

    // Pull in global variable -  TODO:  Need to find a cleaner way to do this
    personIDcounter     = GLOBAL.personIDcounter
    MAP_SECTION_SIZE_X  = GLOBAL.GLOBAL_SECTION_SIZE_X;
    MAP_SECTION_SIZE_Y  = GLOBAL.GLOBAL_SECTION_SIZE_Y;
    io                  = GLOBAL.io;

    this.id = this.getNextid();
    this.salt = this.generateSalt(); // use this for a simple sessionID check
    this.firstName = firstName;
    this.icon = icon;
    this.face = 'fE'; // fE - Facing east
    this.tickCount = 0;
    this.xPos;
    this.yPos;
    this.xSectionStart;
    this.ySectionStart; 
    this.createdDate = Date.now();
    this.currentGameboard;
    this.mode = 'Normal'  // Normal   TODO: Attack (1/4 speed), QUIET MODE (1/8 SPEED), FLEE MODE (+25% speed) , Rest (0 speed)
    this.movementRate = 150;  // 150 - standard  100 - Fast
    
    // below used more for NPC/Monster behaviour
    this.isMonster = false;
    this.xp;
    this.hp;
    this.level;
    this.ai = 'none';

    
    console.log('Person instantiated. ' + GLOBAL.personArray.push(this) + ' people.');  // Add to the global personArray;
};

Person.prototype.movement = function (action) {

    //TODO:  Limit movement server side too, it will help limit monster speed

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

    
    if (this.currentGameboard.gameBoardArray[xPos][yPos] != null) {  // BLOCKED SOMETHING THERE!
        
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
            delete GLOBAL.personArray[monster1.id];                            // delete from person array, but keep stucture. TO DO:  issue person array keeps growing, never get's smaller
            delete this.currentGameboard.gameBoardArray[xPos][yPos];    // delete from game board
        }


        // Check for anything special like a teleport
        this.currentGameboard.checkSpecialAction(this, xPos, yPos);


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
    console.log('Tick: ' + this.tickCount);
    
    this.tickCount++;
    this.emitMovement(); // Send movement to all players

}

// Current direction base on face
Person.prototype.getCurrentDirection = function () {

    var str = this.face;

    switch (this.face) {
        case "fN":
            str = 'up';
            break;
        case "fS":
            face = 'down';
            break;
        case "fW":
            face = 'left';
            break;
        case "fE":
            face = 'right';
            break;
        default:
    }

    return str;
}


// Refresh the gameboard section person is on
Person.prototype.refreshSection = function () {
    
    if(true){
        this.xSectionStart = Math.floor(this.xPos / MAP_SECTION_SIZE_X) * MAP_SECTION_SIZE_X;
        this.ySectionStart = Math.floor(this.yPos / MAP_SECTION_SIZE_Y) * MAP_SECTION_SIZE_Y;
    } else {
    
    //TODO:  Try to put section start points 1 at a time instead of 8.  You will get a scrolling effect
        this.xSectionStart = Math.floor(this.xPos / MAP_SECTION_SIZE_X);
        this.ySectionStart = Math.floor(this.yPos / MAP_SECTION_SIZE_Y);
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

// Set as a monster
Person.prototype.setAsMonster = function () {

    this.isMonster = true;

    // this.aggressive level 0-10
    // this.intelligence level 0-10
}


module.exports = Person;
