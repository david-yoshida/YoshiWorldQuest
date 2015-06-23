/**
 *      Item Manual Class Defined
 *
 *      itemmanual.js  this is essentailly a person.  But we use this function to create quick items.
 */
var Person = require('./person.js');

var ItemManual = function (firstName, icon) {
    
    this.name = 'ItemManual';

    return this;
};


// Current direction base on face
ItemManual.prototype.createWoodenBox = function () {
    
    myItem = new Person('Wooden Box', 'object-treasurebox1');
    myItem.face = 'fW';
    myItem.setAsItem();
    myItem.xp = 1;
    myItem.hp = 1;
    myItem.ai = 'none';
    
    return myItem;
}

module.exports = ItemManual;
