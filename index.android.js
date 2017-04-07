import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';
import './App/Code/initAndroid';
import HomeScreen from './App/Components/HomeScreen';
import SettingsScreen from './App/Components/SettingsScreen';
import KavuahScreen from './App/Components/KavuahScreen';
import EntryScreen from './App/Components/EntryScreen';
import FlaggedDatesScreen from './App/Components/FlaggedDatesScreen';
import NewEntryScreen from './App/Components/NewEntryScreen';
/*import TEST from './App/Components/TEST';*/

AppRegistry.registerComponent('LuachAndroid', () => StackNavigator({
    /*TEST:{screen: TEST},*/
    Home: { screen: HomeScreen },
    Settings: { screen: SettingsScreen },
    Kavuahs: { screen: KavuahScreen },
    Entries: { screen: EntryScreen },
    NewEntry: { screen: NewEntryScreen },
    FlaggedDates: { screen: FlaggedDatesScreen }
}));
