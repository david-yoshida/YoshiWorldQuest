/*!
 * YoshiQuest
 * Copyright(c) 2015 David Yoshida
 */

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));



/**
 *      GAMEBOARD CLASS START
 */
var Gameboard = function (row, col) {
    this.maxRow = row - 1;
    this.maxCol = col - 1;
    
    // Create global array of gameboard
    this.gameBoardArray;
    
    this.gameBoardArray = new Array(row)
    for (i = 0; i < row; i++)
        this.gameBoardArray[i] = new Array(col);

    console.log('Gameboard instantiated');
}

Gameboard.prototype.addPerson = function (person) {
    person.xPos = 0;
    person.yPos = 0;
    person.currentGameboard = this;  // bind them to this particular gameboard

    this.gameBoardArray[0][0] = person; // start position is 0,0

    //if (this.gameBoardArray[0][0] != null) console.log("Something here 2!");
    console.log("Welcome to the gameboard " + this.gameBoardArray[0][0].firstName);
};
// GAMEBOARD CLASS END





/**
 *      PERSON CLASS START
 */
var Person = function (firstName) {
    this.firstName = firstName;
    this.xPos;
    this.yPos;
    this.currentGameboard;
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
    
    delete this.currentGameboard.gameBoardArray[this.xPos][this.yPos];  // remove person from old position

    this.xPos = xPos; // assign to new position
    this.yPos = yPos; // assign to new position
    
    this.currentGameboard.gameBoardArray[this.xPos][this.yPos] = this;  // add person to new position

    console.log('Moved to: ' + this.xPos + '-' + this.yPos);

}

Person.prototype.parseLocationToJSON = function () {
    
    //var str = '{ "name": "John Doe", "age": 42 }';
    //Adjust position to html gameboard co-ordinates
    xPos = this.xPos + 1;
    yPos = this.yPos + 1;


    var str = '{ "firstName": "' + this.firstName + '", "xPos": ' + xPos +  ', "yPos": ' + yPos + ' }';

    return str;
}
// PERSON CLASS END





var gameboard1 = new Gameboard(8,8);
var person1 = new Person('Naomi');

gameboard1.addPerson(person1);  // Add Naomi to the game board









// Don't forget get an post are different
app.post('/', function (req, res) {
    
    var theDirection = req.body.direction;
    var str;
    
    person1.movement(theDirection);
    str = person1.parseLocationToJSON();

    // Write to browser
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(str);

    
});

var server = app.listen(1337, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});











// USER DEFINED FUNCTIONS


