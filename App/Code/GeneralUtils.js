//Returns true if thing is an instance of either a string primitive or String object
function isString(thing) {
    return (typeof thing === 'string' || thing instanceof String);
};

//Returns true if thing is an instance of either a number primitive or Number object
function isNumber(thing) {
    return (typeof thing === 'number' || thing instanceof Number);
};

//Returns whether or not the given, array or string contains the given substring
function has(o, ...arr) {
    if (arr.length === 1 && (arr[0] instanceof Array || isString(arr[0]))) {
        return !!~arr[0].indexOf(o); //A cute trick: bitwise NOT turns -1 into 0
    }
    else {
        return !!~arr.indexOf(o);
    }
};

//Calls the given comparer function for each item in the array.
//The first item encountered for which the comparer returns truthy is returned.
function firstMatch(arr, comparer) {
    for (var i = 0; i < arr.length; i++) {
        if (comparer(arr[i])) {
            return arr[i];
        }
    }
};

//Get first instance of the given item in the given array.
//Search uses strict comparison operator (===) unless we are dealing with strings and caseSensitive is falsey.
//Note: for non-caseSensitive searches, returns the original array item if a match is found.
function getFirst(arr, item, caseSensitive) {
    for (var i = 0; i < arr.length; i++) {
        if ((!caseSensitive) && isString(item) && isString(arr[i]) && item.toLowerCase() === arr[i].toLowerCase()) {
            return arr[i];
        }
        else if (arr[i] === item) {
            return arr[i];
        }
    }
};

//Checks a Date object if it represents a valid date or not
function isValidDate(dt) {
    return (!isNaN(dt.valueOf()));
};

export {isString, isNumber, has, firstMatch, getFirst, isValidDate };