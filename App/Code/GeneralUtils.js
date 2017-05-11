import { PixelRatio, Dimensions } from 'react-native';

/**Gets the current screen width in points */
export function getScreenWidth() {
    return Dimensions.get('window').width;
}

/**Gets the current screen width in pixels */
export function isSmallScreen() {
    return (getScreenWidth() * PixelRatio.get()) < 650;
}

/**Returns true if thing is an instance of either a string primitive or String object.*/
export function isString(thing) {
    return (typeof thing === 'string' || thing instanceof String);
}

/**Returns true if thing is an instance of either a number primitive or Number object.*/
export function isNumber(thing) {
    return (typeof thing === 'number' || thing instanceof Number);
}

/**Checks a Date object if it represents a valid date or not.*/
export function isValidDate(dt) {
    return (!isNaN(dt.valueOf()));
}

/**Returns whether or not the given, array, string, or argument list contains the given item or substring.
 *
 * This function is awfully similar to Array.includes, but has the added plus of accepting any number or type of arguments.*/
export function has(o, ...arr) {
    if (arr.length === 1 && (Array.isArray(arr[0]) || isString(arr[0]))) {
        return arr[0].includes(o);
    }
    else {
        return arr.includes(o);
    }
}

/**Returns the default value only if the param value is undefined, null or NaN.
 *
 * Otherwise, the original param value is returned.
 *
 * This is very useful for boolean, string and integer parameters
 * where we want to keep false, "" and 0 if they were supplied.
 */
export function setDefault(paramValue, defValue) {
    if (typeof paramValue === 'undefined' || paramValue === null || isNaN(paramValue)) {
        return defValue;
    }
    else {
        return paramValue;
    }
}