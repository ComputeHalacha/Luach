/**Returns true if thing is an instance of either a string primitive or String object.*/
function isString(thing) {
    return (typeof thing === 'string' || thing instanceof String);
};

/**Returns true if thing is an instance of either a number primitive or Number object.*/
function isNumber(thing) {
    return (typeof thing === 'number' || thing instanceof Number);
};

/**Checks a Date object if it represents a valid date or not.*/
function isValidDate(dt) {
    return (!isNaN(dt.valueOf()));
};

/**Returns whether or not the given, array, string, or argument list contains the given item or substring.
 *
 * This function is awfully similar to Array.includes, but has the added plus of accepting any number or type of arguments.*/
function has(o, ...arr) {
    if (arr.length === 1 && (arr[0] instanceof Array || isString(arr[0]))) {
        return arr[0].includes(o);
    }
    else {
        return arr.includes(o);
    }
};

export { isString, isNumber, has, isValidDate };