import React, { Component } from 'react';
import { ScrollView, View, Text, Image, TextInput, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import Location from '../Code/JCal/Location';
import SideMenu from './SideMenu';
import { popUpMessage } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';
import DataUtils from '../Code/Data/DataUtils';

export default class FindLocation extends Component {
    static navigationOptions = {
        title: 'Choose your location',
    };
    constructor(props) {
        super(props);
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.onUpdate = onUpdate;
        this.appData = appData;
        this.dispatch = this.props.navigation.dispatch;
        this.navigate = this.props.navigation.navigate;

        const loc = appData.Settings.location || Location.getJerusalem();
        this.locName = loc.Name;
        this.state = {
            list: null,
            searching: false
        };
        this.findLocation = this.findLocation.bind(this);
    }
    update(location) {
        const appData = this.appData;
        appData.Settings.location = location;
        if (this.onUpdate) {
            this.onUpdate(appData);
        }
        this.dispatch(NavigationActions.back());
    }
    findLocation(event) {
        const search = event.nativeEvent.text;
        if (search) {
            this.setState({ searching: true });
            DataUtils.SearchLocations(search).then(list =>
                this.setState({
                    searching: false,
                    list: list
                })
            );
        }
        else {
            popUpMessage('Please enter some text to search for...');
        }
    }
    render() {
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.appData}
                    navigator={this.props.navigation}
                    hideMonthView={true} />
                <ScrollView style={{ flex: 1 }}>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Search Location List</Text>
                        <TextInput style={GeneralStyles.textInput}
                            defaultValue={this.locName}
                            autoFocus={true}
                            placeholder='Search for a location'
                            onEndEditing={value => this.findLocation(value)} />
                    </View>
                    {(this.state.list === null &&
                        <View style={GeneralStyles.emptyListView}>
                            <Text style={GeneralStyles.emptyListText}>
                                Enter any part of a location name to search for...</Text>
                            <Image
                                source={require('../Images/logo.png')}
                                resizeMode='contain'
                                style={GeneralStyles.emptyListImage} />
                        </View>)
                        ||
                        (this.state.searching &&
                            <View style={GeneralStyles.emptyListView}>
                                <Text style={[GeneralStyles.emptyListText, { color: '#595' }]}>
                                    Searching for locations...</Text>
                                <Image
                                    source={require('../Images/logo.png')}
                                    resizeMode='contain'
                                    style={GeneralStyles.emptyListImage} />
                            </View>)
                        ||
                        ((this.state.list.length > 0 &&
                            <View>
                                <View style={GeneralStyles.headerView}>
                                    <Text style={GeneralStyles.headerText}>Select a location...</Text>
                                </View>
                                {this.state.list.map((location, index) =>
                                    <View key={index} style={GeneralStyles.inItemButtonList}>
                                        <TouchableHighlight
                                            underlayColor='#afa'
                                            style={{ flex: 1 }}
                                            onPress={() => this.update(location)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Icon
                                                    name='forward'
                                                    color='#393'
                                                    size={25} />
                                                <Text> {location.Name}</Text>
                                            </View>
                                        </TouchableHighlight>
                                    </View>)
                                }
                            </View>)
                            ||
                            (<View style={GeneralStyles.emptyListView}>
                                <Text style={[GeneralStyles.emptyListText, { color: '#b66' }]}>
                                    There are no Locations in the list that match your search...</Text>
                                <Image
                                    source={require('../Images/logo.png')}
                                    resizeMode='contain'
                                    style={GeneralStyles.emptyListImage} />
                            </View>))
                    }
                </ScrollView>
            </View>
        </View>;
    }
}