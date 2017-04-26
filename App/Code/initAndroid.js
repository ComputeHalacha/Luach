import { PermissionsAndroid } from 'react-native';

const locationPermission = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
PermissionsAndroid.check(locationPermission).then(response => {
    response || requestLocationPermission();
    if(__DEV__) {
        console.log('Location permission granted.');
    }
});


async function requestLocationPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            locationPermission,
            {
                'title': 'Luach Android App  - Location Permission',
                'message': 'The Luach Android App needs access to your general location ' +
                'in order to determine the correct Zmanim.'
            }
        );
        if(__DEV__) {
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can use the location');
            } else {
                console.log('location permission denied');
            }
        }
    } catch (err) {
        if(__DEV__) {
            console.warn(err);
        }
    }
}