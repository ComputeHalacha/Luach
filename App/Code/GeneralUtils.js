import { PixelRatio, Dimensions, Platform, ToastAndroid, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';

/**Gets the current window width in points */
export function getScreenWidth() {
    return Dimensions.get('window').width;
}

/** Gets the current window height in points */
export function getScreenHeight() {
    return Dimensions.get('window').height;
}

/** Is the current screen width less than 650 pixels? */
export function isSmallScreen() {
    return (getScreenWidth() * PixelRatio.get()) < 650;
}

/** Is the current screen width more than 1390 pixels? */
export function isLargeScreen() {
    return (getScreenWidth() * PixelRatio.get()) > 1390;
}

/** Returns true if thing is an instance of either a string primitive or String object.*/
export function isString(thing) {
    return (typeof thing === 'string' || thing instanceof String);
}

/** Returns true if thing is an instance of either a number primitive or Number object.*/
export function isNumber(thing) {
    return (typeof thing === 'number' || thing instanceof Number);
}

/** Checks a Date object if it represents a valid date or not.*/
export function isValidDate(dt) {
    return (!isNaN(dt.valueOf()));
}

/** Returns whether or not the given, array, string, or argument list contains the given item or substring.
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

/** Returns the default value only if the param value is undefined, null or NaN.
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

export function popUpMessage(message, optionalTitle) {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.TOP);
    }
    else {
        Alert.alert(optionalTitle, message);
    }
}

/**
 * Returns an array containing a range of integers.
 * @param {Number} [start] The number to start at. The start number is included in the results. If only one argument is supplied, start will be set to 1.
 * @param {Number} end The top end of the range. Unlike Pythons range function, The end number is included in the results.
 * @returns {[Number]}
 */
export function range(start, end) {
    if (arguments.length === 1) {
        end = start;
        start = 1;
    }
    return Array.from(
        { length: (end - start) + 1 },
        (v, i) => start + i);
}
/**
 * Log message to console
 * @param {*} txt
 */
export function log(txt) {
    if (__DEV__) {
        console.log(txt);
    }
}
/**
 * Warn message to console
 * @param {*} txt
 */
export function warn(txt) {
    if (__DEV__) {
        console.warn(txt);
    }
}
/**
 * Error message to console
 * @param {*} txt
 */
export function error(txt) {
    if (__DEV__) {
        console.error(txt);
    }
}

/**
 * Clears the while navigation stack and goes to the home screen.
 * @param {*} dispatcher
 * @param {*} appData
 */
export function goHomeToday(navigator, appData) {
    const resetAction = NavigationActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({ routeName: 'Home', params: { appData: appData } })
        ]
    });
    navigator.dispatch(resetAction);
}