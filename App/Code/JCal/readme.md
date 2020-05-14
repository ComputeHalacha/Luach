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

To print out the formatted times of sunset and sunrise for July 27th 2023 in Lakewood NJ, you would use:

```javascript
import Zmanim from 'JCal/Zmanim';
import Locations from 'JCal/Locations';
import Utils from 'JCal/Utils';

const {sunrise, sunset} = Zmanim.getSunTimes(
            new Date(2023, 6, 27),
            Locations.Lakewood_NJ);

console.log(`Sunrise: ${Utils.getTimeString(sunrise)} 
             Sunset: ${Utils.getTimeString(sunset)}`);
```
