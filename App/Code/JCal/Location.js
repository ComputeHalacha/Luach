/**Represents a geographic Location. Needed for calculating Zmanim.
If Israel is undefined, if the given coordinates are near the vicinity of Israel it will be assumed that it is in Israel.
UTCOffset is the time zone. Israel is always 2 and the US East coast is -5. England is 0 of course.
If UTCOffset is not specifically supplied, the longitude will be used to get a quasi-educated guess.*/
export default class Location {
    constructor(name, israel, latitude, longitude, utcOffset, elevation, candleLighting, locationId) {
        //If the israel argument was not set at all.
        if (typeof israel === 'undefined' || israel === null) {
            //If the user is within Israels general coordinates,
            //we feel pretty safe assuming they are in Israel.
            //Where else on the map is the user (probablity of Jewishness: 99.99%)?
            //Sinai, Lebanon, Syria, Jordan, in a submarine under the Mediterannian ...
            israel = (latitude > 29.45 && latitude < 33 && longitude < -34.23 && longitude > -35.9);
        }
        if (israel) {
            //Israel has only one immutable time zone
            utcOffset = 2;
        }
        //If the utcOffset argument was not set at all.
        else if (typeof utcOffset === 'undefined' || utcOffset === null) {
            //Try to determine the "correct" time zone using the simple fact that Greenwich is both TZ 0 and longitude 0.
            //Even though technically this is the way it should be,
            //it will be often incorrect as time zones are almost always tweaked to accomadate the closest border.
            utcOffset = -parseInt(longitude / 15);
        }

        this.Name = (name || 'Unknown Location');
        this.Israel = !!israel;
        this.Latitude = latitude;
        this.Longitude = longitude;
        this.UTCOffset = utcOffset || 0;
        this.Elevation = elevation || 0;
        this.CandleLighting = candleLighting || (this.Israel ? 30 : 18);
        this.locationId = locationId;
    }
    /**Gets the Location for Jerusalem.*/
    static getJerusalem() {
        return new Location("Jerusalem", true, 31.78, -35.22, 2, 800);
    }
}