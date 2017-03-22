//Returns true if thing is an instance of either a string primitive or String object
function isString(thing) {
    return (typeof thing === 'string' || thing instanceof String);
};

//Returns true if thing is an instance of either a number primitive or Number object
function isNumber(thing) {
    return (typeof thing === 'number' || thing instanceof Number);
};

//Checks a Date object if it represents a valid date or not
function isValidDate(dt) {
    return (!isNaN(dt.valueOf()));
};

//Returns whether or not the given, array, arguments or string contains the given item or substring
function has(o, ...arr) {
    if (arr.length === 1 && (arr[0] instanceof Array || isString(arr[0]))) {
        return !!~arr[0].indexOf(o); //A cute trick: bitwise NOT turns -1 into 0
    }
    else {
        return !!~arr.indexOf(o);
    }
};

export {isString, isNumber, has, isValidDate };