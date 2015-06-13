/**
 *      PERSON CLASS START
 *
 *      hello.js
 */


/**
 *      PERSON CLASS START
 */
var Hello = function (firstName) {

    this.name = firstName;
    
    console.log('Hello instantiated. ');  // Add to the global personArray;
};


Hello.prototype.test = function () {
    
    console.log('TEST CALLED!');  // Add to the global personArray;
};


module.exports = Hello;