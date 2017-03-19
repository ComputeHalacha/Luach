//Represents a geographic Location. Needed for calculating Zmanim.
//If Israel is undefined, if the location is in the very near vicinity of Israel it will be assumed that it is in Israel.
//UTCOffset is the time zone. Israel is always 2 and the US East coast is -5. England is 0 of course.
//If UTCOffset is not specifically supplied, the longitude will be used to get an educated guess.
export default class Location {
    constructor(name, israel, latitude, longitude, utcOffset, elevation) {
        if (typeof israel === 'undefined') {
            //Israel general coordinates (we are pretty safe even if we are off by a few miles,
            //where else is the (99.99% Jewish) user? Sinai, Lebanon, Syria, Jordan ...
            israel = (latitude > 29.45 && latitude < 33 && longitude < -34.23 && longitude > -35.9);
        }
        if (israel) {
            //Israel has only one immutable time zone
            utcOffset = 2;
        }
        else if (typeof utcOffset === 'undefined') {
            //Determine the "correct" time zone using the simple fact that Greenwich is both TZ 0 and longitude 0
            //Even though technically this is the way it should be, it will be often incorrect as time zones are almost always moved to the closest border.
            utcOffset = -parseInt(longitude / 15);
        }

        this.Name = (name || 'Unknown Location');
        this.Israel = !!israel;
        this.Latitude = latitude;
        this.Longitude = longitude;
        this.UTCOffset = utcOffset || 0;
        this.Elevation = elevation || 0;
    }

    //Gets the Location for Jerusalem.
    static getJerusalem() {
        return new Location("Jerusalem", true, 31.78, -35.22, 2, 800);
    }
}