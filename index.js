import './App/app';
import { configureNotifier } from './App/Code/Notifications';
configureNotifier(token =>
    console.log('Registered Notifications: ' + JSON.stringify(token))
);
if (__DEV__) {
    console.disableYellowBox = true;
}
