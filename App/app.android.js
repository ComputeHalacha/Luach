import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';
import HomeScreen from './Components/HomeScreen';
import SettingsScreen from './Components/SettingsScreen';
import NewOccasionScreen from './Components/NewOccasionScreen';
import OccasionsScreen from './Components/OccasionsScreen';
import KavuahScreen from './Components/KavuahScreen';
import EntryScreen from './Components/EntryScreen';
import FlaggedDatesScreen from './Components/FlaggedDatesScreen';
import NewEntryScreen from './Components/NewEntryScreen';
import NewKavuahScreen from './Components/NewKavuahScreen';
import DateDetailsScreen from './Components/DateDetailsScreen';
import FindKavuahScreen from './Components/FindKavuahScreen';

AppRegistry.registerComponent('LuachAndroid', () => StackNavigator({
    Home: { screen: HomeScreen },
    Settings: { screen: SettingsScreen },
    NewOccasion: { screen: NewOccasionScreen },
    Occasions: { screen: OccasionsScreen },
    Kavuahs: { screen: KavuahScreen },
    Entries: { screen: EntryScreen },
    NewEntry: { screen: NewEntryScreen },
    NewKavuah: { screen: NewKavuahScreen },
    FlaggedDates: { screen: FlaggedDatesScreen },
    DateDetails: { screen: DateDetailsScreen },
    FindKavuahs: { screen: FindKavuahScreen }
}));
