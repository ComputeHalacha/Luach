import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';
import './App/Code/initAndroid';
import HomeScreen from './App/Components/HomeScreen';
import SettingsScreen from './App/Components/SettingsScreen';
import NewOccasionScreen from './App/Components/NewOccasionScreen';
import OccasionsScreen from './App/Components/OccasionsScreen';
import KavuahScreen from './App/Components/KavuahScreen';
import EntryScreen from './App/Components/EntryScreen';
import FlaggedDatesScreen from './App/Components/FlaggedDatesScreen';
import NewEntryScreen from './App/Components/NewEntryScreen';
import NewKavuahScreen from './App/Components/NewKavuahScreen';
import DateDetailsScreen from './App/Components/DateDetailsScreen';
/*import TEST from './App/Components/TEST';*/

AppRegistry.registerComponent('LuachAndroid', () => StackNavigator({
    /*TEST:{screen: TEST},*/
    Home: { screen: HomeScreen },
    Settings: { screen: SettingsScreen },
    NewOccasion: {screen: NewOccasionScreen},
    Occasions :{screen:OccasionsScreen},
    Kavuahs: { screen: KavuahScreen },
    Entries: { screen: EntryScreen },
    NewEntry: { screen: NewEntryScreen },
    NewKavuah: { screen: NewKavuahScreen },
    FlaggedDates: { screen: FlaggedDatesScreen },
    DateDetails:{screen: DateDetailsScreen}
}));
