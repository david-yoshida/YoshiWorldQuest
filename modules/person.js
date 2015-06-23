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
    io = GLOBAL.io;
    personArray = GLOBAL.personArray;

    this.id = this.getNextid();
    this.salt = this.generateSalt(); // use this for a simple sessionID check
    this.firstName = firstName;
    this.icon = icon;
    this.face = 'fE'; // fE - Facing east
    this.stepCount = 0; // how many keystrokes made by player.
    this.xPos;
    this.yPos;
    this.xSectionStart;
    this.ySectionStart; 
    this.createdDate = Date.now();
    this.currentGameboard;
    this.xp = 0;
    this.mode = 'normal'  // normal   attack (1/4 speed), quiet (1/8 SPEED), flee (+25% speed) , Rest (0 speed)
    this.baseMovementRate = 170;  // 170 - standard  100 - Fast
    this.movementRate = 170;  // 170 - standard  100 - Fast
    this.tickCounter = Date.now();
    
    // below used more for NPC/Monster behaviour
    this.isMonster = false;
    this.xpValue;
    this.hp = 10;
    this.level;
    this.ai = 'none';

    // below used more for Item behaviour
    this.isItem = false;

    
    console.log('Person instantiated. ' + personArray.push(this) + ' people.');  // Add to the global personArray;
};

Person.prototype.movement = function (action) {


    // Check if proper time has passed since last movement
    if (Date.now() - this.tickCounter > this.movementRate) { 

        // Assign global variables to local variable before a final move has been determined
        var xPos = this.xPos;
        var yPos = this.yPos;
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

            // Attempt attack if person is in attack mode and blocked space is a monster
            if (this.mode == "attack" & this.currentGameboard.gameBoardArray[xPos][yPos].isMonster) {

                monster1 = this.currentGameboard.gameBoardArray[xPos][yPos];
                console.log("ATTEMPT ATTACK! " + this.firstName + " strikes at " + monster1.firstName + "!!");

                /*
                *  Attacker 1d6 roll - 5 or 6 hits  
                *
                *  Defender 1d6 roll - 4,5,6 blocks
                */
                if (true) {// hit! 1d4

                    daggerDamage = Math.floor((Math.random() * 4) + 1);  // 1d4
                    monster1.hp = monster1.hp - daggerDamage;

                    console.log("SUCCESSFUL HIT! " + daggerDamage + " hp damage! " + monster1.hp + "hp remaining!");

                    // Check if kill took place
                    if (monster1.hp <= 0) {

                        var strEmit = '{ "id": ' + monster1.id +
                            ',"firstName": "' + monster1.firstName +
                            '","icon": "' + monster1.icon +
                            '", "xPos": ' + monster1.xPos +
                            ', "yPos": ' + monster1.yPos +
                            ' }';

                        io.sockets.emit('remove person', strEmit);                  // broadcast remove person


                        //delete GLOBAL.personArray[monster1.id];       // does not work as the monster1.id is the same as array length. Referring to memory location should be faster than searching through id.,  perhaps a garbage collector type of program needs to be run.
                        personArray[monster1.id].isMonster = false;     // delete from person array, but keep stucture. TO DO:  issue person array keeps growing, never get's smaller

                        // Collect XP
                        this.xp = this.xp + personArray[monster1.id].xpValue;
                        console.log("XP Awarded! " + personArray[monster1.id].xpValue + ", total player xp is:" + this.xp);

                        delete this.currentGameboard.gameBoardArray[xPos][yPos];    // delete from game board
                    }


                }

            }


            // Check for anything special like a teleport
            this.currentGameboard.checkSpecialAction(this, xPos, yPos); //Check special action like teleport


        } else {

            delete this.currentGameboard.gameBoardArray[this.xPos][this.yPos];  // remove person from old position

            this.xPos = xPos; // assign to new position
            this.yPos = yPos; // assign to new position
            this.face = face;
            this.refreshSection();// Refresh the section co-ordinates person is in now

            this.currentGameboard.gameBoardArray[this.xPos][this.yPos] = this;  // add person to new position

            this.tickCounter = Date.now(); // timestamp of move
        }


        this.emitMovement(); // Send movement to all players


    }

    console.log('Move: ' + this.firstName + ' (' + this.xPos + '-' + this.yPos + ')');
    console.log('step: ' + this.stepCount);
    
    this.stepCount++;


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
                ', "movementRate": ' + this.movementRate +
                ' }';

    return str;
}

// Set as a monster
Person.prototype.setAsMonster = function () {

    this.isMonster = true;

    // this.aggressive level 0-10
    // this.intelligence level 0-10
}

// Set as a monster
Person.prototype.setAsItem = function () {

    this.isItem = true;
}


module.exports = Person;





//  Check if person ID exists in the array - TODO:  Not used on server side, find a better place to keep it.
function findInArray(myArray, id) {  // id - Check if this Id exists in the person Array, if not return a -1;  Used more on the client side

    var personExists = -1;

    for (i = 0; i < myArray.length; i++) {
        if (myArray[i].id == id) personExists = i; // found id!
    }

    return personExists;
}
