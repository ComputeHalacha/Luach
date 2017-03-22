/// <reference path="Zmanim.js" />
"use strict";


export default function Utils() { }
Utils.jMonthsEng = ["", "Nissan", "Iyar", "Sivan", "Tamuz", "Av", "Ellul", "Tishrei", "Cheshvan", "Kislev", "Teves", "Shvat", "Adar", "Adar Sheini"];
Utils.jMonthsHeb = ["", "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול", "תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר", "אדר שני"];
Utils.sMonthsEng = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Utils.dowEng = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Erev Shabbos", "Shabbos Kodesh"];
Utils.dowHeb = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "ערב שבת קודש", "שבת קודש"];
Utils.jsd = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
Utils.jtd = ['י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
Utils.jhd = ['ק', 'ר', 'ש', 'ת'];
Utils.jsnum = ["", "אחד", "שנים", "שלשה", "ארבעה", "חמשה", "ששה", "שבעה", "שמונה", "תשעה"];
Utils.jtnum = ["", "עשר", "עשרים", "שלושים", "ארבעים"];

//Gets the Jewish representation of a number (365 = שס"ה)
//Minimum number is 1 and maximum is 9999.
Utils.toJNum = function (number) {
    if (number < 1) {
        throw new Error("Min value is 1");
    }

    if (number > 9999) {
        throw new Error("Max value is 9999");
    }

    var n = number,
        retval = '';

    if (n >= 1000) {
        retval += Utils.jsd[parseInt((n - (n % 1000)) / 1000) - 1] + "'";
        n = n % 1000;
    }

    while (n >= 400) {
        retval += 'ת';
        n -= 400;
    }

    if (n >= 100) {
        retval += Utils.jhd[parseInt((n - (n % 100)) / 100) - 1];
        n = n % 100;
    }

    if (n == 15) {
        retval += "טו";
    }
    else if (n == 16) {
        retval += "טז";
    }
    else {
        if (n > 9) {
            retval += Utils.jtd[parseInt((n - (n % 10)) / 10) - 1];
        }
        if ((n % 10) > 0) {
            retval += Utils.jsd[(n % 10) - 1];
        }
    }
    if (number > 999 && (number % 1000 < 10)) {
        retval = "'" + retval;
    }
    else if (retval.length > 1) {
        retval = (retval.slice(0, -1) + "\"" + retval[retval.length - 1]);
    }
    return retval;
};

//Add two character suffix to number. e.g. 21st, 102nd, 93rd, 500th
Utils.toSuffixed = function (num) {
    var t = num.toString(),
        suffix = "th";
    if (t.length === 1 || (t[t.length - 2] !== '1')) {
        switch (t[t.length - 1]) {
            case '1':
                suffix = "st";
                break;
            case '2':
                suffix = "nd";
                break;
            case '3':
                suffix = "rd";
                break;
        }
    }
    return t + suffix;
};

// Get day of week using Javascripts getDay function.
//Important note: months starts at 1 not 0 like javascript
//The DOW returned though, has Sunday = 0
Utils.getSdDOW = function (year, month, day) {
    return new Date(year, month - 1, day).getDay();
};

//Makes sure hour is between 0 and 23 and minute is between 0 and 59
//Overlaps get added/subtracted.
//The argument needs to be an object in the format {hour : 12, minute :42 }
Utils.fixHourMinute = function (hm) {
    //make a copy - javascript sends object parameters by reference
    var result = { hour: hm.hour, minute: hm.minute };
    while (result.minute < 0) {
        result.minute += 60;
        result.hour--;
    }
    while (result.minute >= 60) {
        result.minute -= 60;
        result.hour++;
    }
    if (result.hour < 0) {
        result.hour = 24 + (result.hour % 24);
    }
    if (result.hour > 23) {
        result.hour = result.hour % 24;
    }
    return result;
};

//Add the given number of minutes to the given time
//The argument needs to be an object in the format {hour : 12, minute :42 }
Utils.addMinutes = function (hm, minutes) {
    return Utils.fixHourMinute({ hour: hm.hour, minute: hm.minute + minutes });
};

//Gets the time difference between two times of day
//Both arguments need to be an object in the format {hour : 12, minute :42 }
Utils.timeDiff = function (time1, time2) {
    return Utils.fixHourMinute(Utils.addMinutes(time1, Utils.totalMinutes(time2)));
};

//Gets the total number of minutes in the given time
//The argument needs to be an object in the format {hour : 12, minute :42 }
Utils.totalMinutes = function (time) {
    return time.hour * 60 + time.minutes;
};

//Returns the given time in a formatted string.
//The argument needs to be an object in the format {hour : 23, minute :42 }
//if army is falsey, the returned string will be: 11:42 PM otherwise it will be 23:42
Utils.getTimeString = function (hm, army) {
    if (!!army) {
        return (hm.hour.toString() + ":" +
            (hm.minute < 10 ? "0" + hm.minute.toString() : hm.minute.toString()));
    }
    else {
        return (hm.hour <= 12 ? (hm.hour == 0 ? 12 : hm.hour) : hm.hour - 12).toString() +
            ":" +
            (hm.minute < 10 ? "0" + hm.minute.toString() : hm.minute.toString()) +
            (hm.hour < 12 ? " AM" : " PM");
    }
};

//Gets the UTC offset in whole hours for the users time zone
//Note: this is not affected by DST - unlike javascripts getTimezoneOffset() function which gives you the current offset.
Utils.currUtcOffset = function () {
    var date = new Date(),
        jan = new Date(date.getFullYear(), 0, 1),
        jul = new Date(date.getFullYear(), 6, 1);
    return -parseInt(Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()) / 60);
};

//Determines if the given date is within DST on the users system
Utils.isDateDST = function (date) {
    return (-parseInt(date.getTimezoneOffset() / 60)) !== Utils.currUtcOffset();
};

//Determines if the users system is currently set to DST
Utils.isDST = function () {
    return Utils.isDateDST(new Date());
};

//Determines if the given date and time are during DST according to the USA rules
Utils.isUSA_DST = function (date) {
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours();

    if (month < 3 || month == 12) {
        return false;
    }
    else if (month > 3 && month < 11) {
        return true;
    }

    //DST starts at 2 AM on the second Sunday in March
    else if (month === 3) { //March
        //Gets day of week on March 1st
        var firstDOW = Utils.getSdDOW(year, 3, 1),
            //Gets date of second Sunday
            targetDate = firstDOW == 0 ? 8 : ((7 - (firstDOW + 7) % 7)) + 8;

        return (day > targetDate || (day === targetDate && hour >= 2));
    }
    //DST ends at 2 AM on the first Sunday in November
    else //dt.Month == 11 / November
    {
        //Gets day of week on November 1st
        var firstDOW = Utils.getSdDOW(year, 11, 1),
            //Gets date of first Sunday
            targetDate = firstDOW === 0 ? 1 : ((7 - (firstDOW + 7) % 7)) + 1;

        return (day < targetDate || (day === targetDate && hour < 2));
    }
};

//Determines if the given date and time is during DST according to the current (5776) Israeli rules
Utils.isIsrael_DST = function (date) {
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours();

    if (month > 10 || month < 3) {
        return false;
    }
    else if (month > 3 && month < 10) {
        return true;
    }
    //DST starts at 2 AM on the Friday before the last Sunday in March
    else if (month === 3) { //March
        //Gets date of the Friday before the last Sunday
        var lastFriday = (31 - Utils.getSdDOW(year, 3, 31)) - 2;
        return (day > lastFriday || (day === lastFriday && hour >= 2));
    }
    //DST ends at 2 AM on the last Sunday in October
    else //dt.Month === 10 / October
    {
        //Gets date of last Sunday in October
        var lastSunday = 31 - Utils.getSdDOW(year, 10, 31);
        return (day < lastSunday || (day === lastSunday && hour < 2));
    }
}

//The current time in Israel - determined by the current users system time and time zone offset
Utils.getSdNowInIsrael = function () {
    var now = new Date(),
        //first determine the hour differential between this user and Israel time
        israelTimeOffset = 2 + -Utils.currUtcOffset();
    //This will give us the current correct date and time in Israel
    return new Date(now.setHours(now.getHours() + israelTimeOffset));
};