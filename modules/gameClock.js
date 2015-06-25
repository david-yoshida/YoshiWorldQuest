/**
 *      Game Clock defined
 *
 *      gameClock.js
 *      
 * 
 *      Controls:
 *      
 *      Game sequence - done
 *      Monster movement - in progress
 *      Attack spells - 
 * 
 * 
 * 
 * 
 */
 var GameClock = function () {

     /**
      *         Action phases
      *         
      *         Step 1. Move
      *         Step 2. Attack and Spells
      *         Step 3. Re-spawn, or special?
      */
 	
     //personArray = GLOBAL.personArray;
    //this.hashtag    = hashtag;

    console.log('Game Clock instantiated ');
}

GameClock.prototype.helloWorld = function (person) {

    console.log("Hello World!");

};

GameClock.prototype.moveMonsters = function (personArray) {
    
    console.log("Move Monsters - start");
    console.log("Move Monsters - Person Array Length: " + personArray.length);
    
    monsterCounter = 0;

    // TODO: use a monster array for each gameboard to improve performance, and only move if there is a character on the same grid.

    // TODO: Create IA for various behaviour type (Sticky, Wander, Aggressive, Slow poke, etc.)

    for (i = 0; i < personArray.length; i++) {
        if(personArray[i].isMonster && personArray[i].ai == 'wandering') {

            person = personArray[i];
            x = Math.floor((Math.random() * 20) + 1); 

            switch (true) {
                case (x == 1):
                    str = 'up';
                    break;
                case (x == 2):
                    str = 'down';
                    break;
                case (x == 3):
                    str = 'left';
                    break;
                case (x == 4):
                    str = 'right';
                    break;
                default:
                    str = person.getCurrentDirection();
            }

            person.movement(str);  //TODO:  need to improve performance.  10 monster moves will call each browser 10 times.
            monsterCounter++;

            //console.log("Move Monster!" + str + " rnd" + x);

        }
    }
    
    console.log("Move Monsters - processed " + monsterCounter);
};

module.exports = GameClock;