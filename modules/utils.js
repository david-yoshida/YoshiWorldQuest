/**
 *      HANDY FUNCTIONS 
 *
 *		Can be used for client or server side
 *
 *      utils.js
 */


//  Check if person ID exists in the array - TODO:  Not used on server side, find a better place to keep it.
function findInArray(myArray, id) {  // id - Check if this Id exists in the person Array, if not return a -1;  Used more on the client side
    
    var personExists = -1;
    
    for (i = 0; i < myArray.length; i++) {
        if (myArray[i].id == id) personExists = i; // found id!
    }
    
    return personExists;
}
