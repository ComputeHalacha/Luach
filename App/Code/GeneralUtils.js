import {
    PixelRatio,
    Dimensions,
    Platform,
    ToastAndroid,
    Alert,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import DeviceInfo from 'react-native-device-info';
import firstTime from 'react-native-catch-first-time';
import jDate from './JCal/jDate';
import Utils from './JCal/Utils';
import Location from './JCal/Location';
import DataUtils from './Data/DataUtils';

const GLOBAL_FIRST_TIME_RANDOM = 'ed92c2efd74740dbb72da04f17ff922b1';

export const GLOBALS = Object.freeze({
    VERSION_NAME: DeviceInfo.getReadableVersion().replace(/(.+)\..+/, '$1'),
    IS_IOS: Platform.OS === 'ios',
    IS_ANDROID: Platform.OS === 'android',
    BUTTON_COLOR: Platform.OS === 'android' ? '#99b' : null,
});

export function popUpMessage(message, optionalTitle) {
    if (GLOBALS.IS_ANDROID) {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    } else {
        Alert.alert(optionalTitle, message);
    }
}

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
    return getScreenWidth() * PixelRatio.get() < 650;
}

/** Is the current screen width more than 1390 pixels? */
export function isLargeScreen() {
    return getScreenWidth() * PixelRatio.get() > 1390;
}

/** Returns true if "thing" is either a string primitive or String object.*/
export function isString(thing) {
    return typeof thing === 'string' || thing instanceof String;
}
/** Returns true if "thing" is either a number primitive or a Number object.*/
export function isNumber(thing) {
    return typeof thing === 'number' || thing instanceof Number;
}
/** Returns true if "thing" is a Date object containing a valid date.*/
export function isValidDate(thing) {
    return thing instanceof Date && !isNaN(thing.valueOf());
}
/** Returns whether or not the given, array, string, or argument list contains the given item or substring.
 *
 * This function is awfully similar to Array.includes, but has the added plus of accepting any number or type of arguments.*/
export function has(o, ...arr) {
    if (arr.length === 1 && (Array.isArray(arr[0]) || isString(arr[0]))) {
        return arr[0].includes(o);
    } else {
        return arr.includes(o);
    }
}
/** Returns the first value unless it is undefined, null or NaN.
 *
 * This is very useful for boolean, string and integer parameters
 * where we want to keep false, "" and 0 if they were supplied.
 *
 * Similar purpose to default parameters with the difference being that this function will return
 * the second value if the first is NaN or null, while default params will give give you the NaN or the null.
 */
export function setDefault(paramValue, defValue) {
    return isNullish(paramValue) ? defValue : paramValue;
}
/**
 * Returns true only if the given value is null, undefined or NaN.
 * @param {*} val
 */
export function isNullish(val) {
    return typeof val === 'undefined' || val === null || isNaN(val);
}
/**
 * Returns true only if the given value is false, null, undefined or NaN.
 * @param {*} val
 */
export function isNullishOrFalse(val) {
    return isNullish(val) || val === false;
}
/**
 * Returns true only if the given value is an empty string, null, undefined or NaN.
 * @param {*} val
 */
export function isNullishOrEmpty(val) {
    return isNullish(val) || val === '';
}
/**
 * Returns true only if the given value is a string with no non-whitespace characters,
 * null, undefined or NaN.
 * @param {*} val
 */
export function isNullishOrWhitespace(val) {
    return isNullish(val) || (isString(val) && !val.trim());
}
/**
 * Returns true only if the given value is 0, null, undefined or NaN.
 * @param {*} val
 */
export function isNullishOrZero(val) {
    return isNullish(val) || val === 0;
}
/**
 * Returns an array containing a range of integers.
 * @param {Number} [start] The number to start at. The start number is included in the results.
 * If only one argument is supplied, start will be set to 1.
 * @param {Number} end The top end of the range.
 * Unlike Pythons range function, The end number is included in the results.
 * @returns {[Number]}
 */
export function range(start, end) {
    if (!arguments.length) {
        throw new Error('The "end" value must be supplied');
    } else {
        if (arguments.length < 2 || isNullish(start)) {
            end = start;
            start = 1;
        }
        return Array.from({ length: end - start + 1 }, (v, i) => start + i);
    }
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
 * Clears the navigation stack and goes to today on the home screen.
 * @param {Navigator} dispatcher
 * @param {AppData} appData
 */
export function goHomeToday(navigator, appData) {
    const resetAction = NavigationActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({
                routeName: 'Home',
                params: {
                    appData: appData,
                },
            }),
        ],
    });
    navigator.dispatch(resetAction);
}
/**
 * Gets the proper Jewish Date at the current time at the current location
 * @param {AppData} appData
 */
export function getTodayJdate(appData) {
    if (
        appData &&
        appData.Settings &&
        !appData.Settings.navigateBySecularDate
    ) {
        return Utils.nowAtLocation(appData.Settings.location);
    } else {
        return new jDate();
    }
}

/**
 * Tries to guess the users location from the set time zone name and current utcoffset.
 * Default is Lakewood NJ.
 */
export async function tryToGuessLocation() {
    const timeZoneName = DeviceInfo.getTimezone(),
        cityName = timeZoneName.replace(/.+\/(.+)/, '$1').replace('_', ' '),
        foundList = await DataUtils.SearchLocations(cityName, true);

    log(`Device time zone is set to: ${timeZoneName}`);
    return foundList[0] || Location.getLakewood();
}

/**
 * Returns true if this app has never been launched yet.
 * Determined by a Asyn storage key.
 */
export async function isFirstTimeRun() {
    let isFirstTime = false;
    try {
        await firstTime(GLOBAL_FIRST_TIME_RANDOM);
    } catch (err) {
        //The weirdish react-native-catch-first-time package,
        //calls Promise.reject('Running first time') if this is a first-time launch.
        isFirstTime = true;
    }
    return isFirstTime;
}

/**
 * Get a random number of the specified length.
 * @param {Number} length
 */
export function getRandomNumber(length) {
    return Math.floor(
        10 ** (length - 1) + Math.random() * (9 * 10 ** (length - 1))
    );
}
