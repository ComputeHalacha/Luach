import { AsyncStorage, PermissionsAndroid } from 'react-native';
import GeneralSettings from './GeneralSettings';
import ChashSettings from './Chashavshavon/Settings';
import Location from './JCal/Location';

(() => {
    const locationPermission = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
    const General = {};

    //Everything is storage is stored in the General object.
    AsyncStorage.getAllKeys((err, keys) => {
        AsyncStorage.multiGet(keys, (err, stores) => {
            stores.map((result, i, store) => {
                General[store[i][0]] = store[i][1];
            });
        });
    });

    if (!General.generalSettings) {
        General.generalSettings = new GeneralSettings();
        AsyncStorage.setItem('generalSettings', JSON.stringify(General.generalSettings));
    }
    if (!General.chashSettings) {
        General.chashSettings = new ChashSettings();
        AsyncStorage.setItem('chashSettings', JSON.stringify(General.chashSettings));
    }
    if (!General.locations) {
        General.locations = Location.getLocationsList();
        AsyncStorage.setItem('locations', JSON.stringify(General.locations));
    }

    PermissionsAndroid.check(locationPermission).then(response => {
        response || requestLocationPermission();
    });

    export default General;

    async function requestLocationPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                locationPermission,
                {
                    'title': 'Luach Android App  - Location Permission',
                    'message': 'The Luach Android App needs access to your general location ' +
                    'in order to determine the correct Zmanim.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the location")
            } else {
                console.log("location permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    }
})();