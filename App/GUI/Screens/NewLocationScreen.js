import React from 'react';
import { ScrollView, View, Text, Button, Switch, TextInput, TouchableOpacity, Alert, Picker } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import { CoordinatesChooser, CoordinatesType } from '../Components/CoordinatesChooser';
import Location from '../../Code/JCal/Location';
import DataUtils from '../../Code/Data/DataUtils';
import { warn, error, popUpMessage, range, GLOBALS } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class NewLocation extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { location, onUpdate } = navigation.state.params;
        return {
            title: location ? `Edit ${location.Name}` : 'New Location',
            headerRight: location &&
                <TouchableOpacity onPress={() =>
                    NewLocation.deleteLocation(location, () => {
                        if (onUpdate) {
                            onUpdate();
                        }
                        navigation.dispatch(NavigationActions.back());
                    })}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginRight: 5 }}>
                        <Icon name='delete-forever'
                            color='#a33'
                            size={20} />
                        <Text style={{
                            fontSize: 9,
                            color: '#a33'
                        }}>Remove</Text>
                    </View>
                </TouchableOpacity>
        };
    };

    constructor(props) {
        super(props);
        const navigation = this.props.navigation;

        this.navigate = navigation.navigate;
        this.dispatch = navigation.dispatch;

        const { location, appData, onUpdate } = navigation.state.params;

        this.onUpdate = onUpdate;
        this.appData = appData;

        let name, israel, latitude, longitude, utcoffset, elevation, candles;
        if (location) {
            this.location = location;
            name = location.Name;
            israel = !!location.Israel;
            latitude = location.Latitude;
            longitude = location.Longitude;
            utcoffset = location.UTCOffset;
            elevation = location.Elevation;
            candles = location.Candles;
        }
        else {
            name = 'New Location';
            israel = false;
            latitude = 0;
            longitude = 0;
            utcoffset = 0;
            elevation = 0;
            candles = 18;
        }

        this.state = {
            name,
            israel,
            latitude,
            longitude,
            utcoffset: (israel ? 2 : utcoffset) || 0,
            elevation: elevation || 0,
            candles: candles || 18
        };

        this.addLocation = this.addLocation.bind(this);
        this.updateLocation = this.updateLocation.bind(this);
    }
    addLocation() {
        const location = new Location(
            this.state.name,
            this.state.israel,
            this.state.latitude,
            this.state.longitude,
            this.state.utcoffset,
            this.state.elevation,
            this.state.candles);
        DataUtils.LocationToDatabase(location).then(() => {
            popUpMessage(`The location "${location.Name}" has been successfully added.`,
                'Add Location');
            if (this.onUpdate) {
                this.onUpdate(location);
            }
            this.dispatch(NavigationActions.back());
        }
        ).catch(err => {
            warn('Error trying to add location to the database.');
            error(err);
        });
    }
    updateLocation() {
        const location = this.location,
            origLocation = location.clone();
        location.Name = this.state.name;
        location.Israel = this.state.israel;
        location.Latitude = this.state.latitude;
        location.Longitude = this.state.longitude;
        location.UTCOffset = this.state.utcoffset;
        location.Elevation = this.state.elevation;
        location.CandleLighting = this.state.candles;

        DataUtils.LocationToDatabase(location).then(() => {
            if (this.onUpdate) {
                this.onUpdate(location);
            }
            popUpMessage(`The location ${location.Name} has been successfully saved.`,
                'Change Location');
        }
        ).catch(err => {
            popUpMessage('We are sorry, Luach is unable to save the changes to this location.\nPlease contact luach@compute.co.il.');
            warn('Error trying to add save the changes to the database.');
            error(err);
            //Revert changes
            location.Name = origLocation.Name;
            location.Israel = origLocation.Israel;
            location.Latitude = origLocation.Latitude;
            location.Longitude = origLocation.Longitude;
            location.UTCOffset = origLocation.UTCOffset;
            location.Elevation = origLocation.Elevation;
            location.CandleLighting = origLocation.CandleLighting;
        });
    }
    /**
     * Delete an Location from the database, then run the onUpdate function.
     * @param {Location} location
     * @param {AppData} appDatalocation
     * @param {Function} onUpdate
     */
    static deleteLocation(location, appData, onUpdate) {
        Alert.alert(
            'Confirm Location Removal',
            'Are you sure that you want to completely remove this Location?',
            [   //Button 1
                { text: 'Cancel', onPress: () => { return; }, style: 'cancel' },
                //Button 2
                {
                    text: 'OK', onPress: () => {
                        const locationId = location.locationId;
                        DataUtils.DeleteLocation(location)
                            .then(() => {
                                if (appData.Settings.location.locationId === locationId) {
                                    appData.Settings.location = appData.Settings.location.Israel
                                        ? Location.getJerusalem()
                                        : Location.getLakewood();
                                }
                                popUpMessage(`The location "${location.Name}" has been successfully removed.`,
                                    'Remove location');
                                if (onUpdate) {
                                    onUpdate();
                                }
                            })
                            .catch(err => {
                                warn('Error trying to delete an location from the database.');
                                error(err);
                            });
                    }
                }]);
    }
    render() {
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.appData}
                    navigator={this.props.navigation}
                    currDate={this.state.jdate} />
                <ScrollView style={{ flex: 1 }}>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Location Name</Text>
                        <TextInput style={GeneralStyles.textInput}
                            onEndEditing={event =>
                                this.setState({ name: event.nativeEvent.text })}
                            defaultValue={this.state.name}
                            placeholder='Location name'
                            maxLength={200} />
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Longitude</Text>
                        <CoordinatesChooser
                            coordinatesType={CoordinatesType.Longitude}
                            value={this.state.longitude}
                            setCoordinates={longitude => this.setState({ longitude })} />
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Latitude</Text>
                        <CoordinatesChooser
                            coordinatesType={CoordinatesType.Latitude}
                            value={this.state.latitude}
                            setCoordinates={latitude => this.setState({ latitude })} />
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Is this location in Israel?</Text>
                        <Switch style={GeneralStyles.switch}
                            value={this.state.israel}
                            onValueChange={value => this.setState(
                                {
                                    israel: value,
                                    utcoffset: value
                                        ? 2
                                        : this.state.utcoffset
                                })} />
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Time Zone offset</Text>
                        <Picker style={GeneralStyles.picker}
                            onValueChange={utcoffset => this.setState({ utcoffset })}
                            selectedValue={this.state.utcoffset}>
                            {range(-12, 12).map(i =>
                                <Picker.Item
                                    value={i}
                                    key={i}
                                    label={`GMT ${i >= 0 ? '+' : '-'} ${Math.abs(i)}`} />
                            )}
                        </Picker>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Elevation</Text>
                        <TextInput style={GeneralStyles.textInput}
                            onEndEditing={event => {
                                if (!isNaN(event.nativeEvent.text)) {
                                    this.setState({
                                        elevation: (parseInt(event.nativeEvent.text) * 3.28084).toFixed()
                                    });
                                }
                                else {
                                    popUpMessage('Please enter a valid number');
                                }
                            }}
                            value={`${(this.state.elevation / 3.28084).toFixed(0)} feet`}
                            defaultValue={`${(this.state.elevation / 3.28084).toFixed(0)} feet`}
                            placeholder='Enter elevation in feet'
                            keyboardType='numeric'
                            disableFullscreenUI={true}
                        />
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Candle Lighting</Text>
                        <Picker style={GeneralStyles.picker}
                            onValueChange={candles => this.setState({ candles })}
                            selectedValue={`${this.state.candles} minutes before sunset`}                            >
                            {range(18, 60).map(i =>
                                <Picker.Item
                                    value={i}
                                    key={i}
                                    label={`${i} minutes before sunset`} />
                            )}
                        </Picker>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <View style={GeneralStyles.btnAddNew}>
                            <Button
                                title={this.location ? 'Save Changes' : 'Add This Location'}
                                onPress={this.location ? this.updateLocation : this.addLocation}
                                accessibilityLabel={(this.location
                                    ? 'Save Changes to '
                                    : 'Add ') + this.state.name}
                                color={GLOBALS.BUTTON_COLOR} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>;
    }
}