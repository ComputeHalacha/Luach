# JCal

A Javascript library for Jewish date calculations

-   Conversion back and forth from javascript Date objects
-   Zmanim calculations for any date and location - sunrise/sunset, chatzos, sha'a zmanis etc. for any date and location.
-   Jewish Holidays/Fasts etc, for any date and location
-   Sedra of the week for any date and location
-   Daf Yomi for any day since daf yomi was initiated
-   Molad of any month
-   Day of Sefirah - including function to get nusach of counting
-   Jewish date calculation functions such as calculation of interval between dates etc.

A Jewish Date is represented by an instance of the jDate class.

## Examples

To print out today's Jewish date, you would write:

```javascript
import jDate from "JCal/jDate";

const jewishDate = new jDate();
console.write(jewishDate.toString());
```

The code above would return:

```
Thursday, the 3rd of Kislev 5777
```

To print out the times of sunset and sunrise for July 27th 2017 in Lakewood NJ, you would use:

```javascript
import Location from 'JCal/Location';
import Zmanim from 'JCal/Zmanim';
import Utils from 'JCal/Utils';

const lakewood = Location.getLakewood(),
    date = new Date(2017, 6, 27),
    sunTimes = Zmanim.getSunTimes(date, lakewood),
    sunrise = Utils.getTimeString(sunTimes[0]),
    sunset = Utils.getTimeString(sunTimes[1]),

    console.log(`Sunrise: ${sunrise}, Sunset: ${sunset}`);
```
