/**
 *      Monster Manual Class Defined
 *
 *      monster.js  this is essentailly a person.  But we use this function to create quick monsters.
 */
var Person = require('./person.js');

var MonsterManual = function (firstName, icon) {
    
    this.name = 'MonsterManual';

    return this;
};


// Current direction base on face
MonsterManual.prototype.createKnight = function () {
    
    myMonster = new Person('Knight', 'monster-mount1');
    myMonster.setAsMonster();
    myMonster.xp = 1;
    myMonster.hp = 1;
    myMonster.level = 2;
    myMonster.ai = 'wandering';
    
    return myMonster;
}

// Current direction base on face
MonsterManual.prototype.createCrow = function () {
    
    myMonster = new Person('caw caw...', 'monster-crow1');
    myMonster.setAsMonster();
    myMonster.xp = 0.1;
    myMonster.hp = 1;
    myMonster.level = 0;
    myMonster.ai = 'none';
    myMonster.modalDescription = 'homestead-crow.jpg';

    
    return myMonster;
}



module.exports = MonsterManual;
