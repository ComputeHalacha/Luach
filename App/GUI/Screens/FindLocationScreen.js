import React from 'react';
import { ScrollView, View, Text, Image, TextInput, TouchableHighlight, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import SideMenu from '../Components/SideMenu';
import { popUpMessage } from '../../Code/GeneralUtils';
import DataUtils from '../../Code/Data/DataUtils';
import Settings from '../../Code/Settings';
import { GeneralStyles } from '../styles';

export default class FindLocation extends React.PureComponent {
    static navigationOptions = ({ navigation }) => {
        const { appData } = navigation.state.params;
        return {
            title: 'Find Location',
            headerRight:
                <TouchableHighlight
                    onPress={() =>
                        navigation.navigate('NewLocation', { appData })}>
                    <View style={{ marginRight: 10 }}>
                        <Icon name='add'
                            color='#aac'
                            size={25} />
                        <Text style={{ fontSize: 10, color: '#aac' }}>New Location</Text>
                    </View>
                </TouchableHighlight>
        };
    };

    constructor(props) {
        super(props);
        const { appData, onUpdate } = this.props.navigation.state.params;
        this.onUpdate = onUpdate;
        this.appData = appData;
        this.dispatch = this.props.navigation.dispatch;
        this.navigate = this.props.navigation.navigate;
        this.state = {
            list: null,
            searching: false
        };
        this.findLocation = this.findLocation.bind(this);
    }
    update(location) {
        const appData = this.appData;
        if (appData.Settings.location.locationId !== location.locationId) {
            Settings.saveLocation(location).then(() => {
                appData.Settings.location = location;
                if (this.onUpdate) {
                    this.onUpdate(appData);
                }
            });
        }
        this.dispatch(NavigationActions.back());
    }
    edit(location) {
        const appData = this.appData;
        this.navigate('NewLocation',
            {
                appData,
                location,
                onUpdate: (l) => {
                    this.findLocation();
                    const appData = this.appData;
                    //In case the name or coordnates were changed.
                    if (appData.Settings.location.locationId === l.locationId) {
                        appData.Settings.location = location;
                        if (this.onUpdate) {
                            this.onUpdate(appData);
                        }
                    }
                }
            });
    }
    findLocation(search) {
        if (search) {
            this.searchText = search;
        }
        else {
            search = this.searchText;
        }
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
        let message, color;
        if (this.state.list === null) {
            //initial state of the screen
            message = 'Your current location is ' + this.appData.Settings.location.Name;
            color = '#77b';
        }
        else if (this.state.list.length === 0) {
            //After a search with no results
            message = 'There are no Locations in the list that match your search...';
            color = '#b66';
        }
        else if (this.state.searching) {
            //During a search
            message = 'Searching for locations...';
            color = '#595';
        }
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.appData}
                    navigator={this.props.navigation} />
                <ScrollView style={{ flex: 1 }}>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Search Location List</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TextInput style={[GeneralStyles.textInput, { width: '85%' }]}
                                autoFocus={true}
                                placeholder='Enter search text...'
                                accessibilityLabel='Search for a location'
                                autoCorrect={false}
                                spellCheck={false}
                                onEndEditing={event => this.findLocation(event.nativeEvent.text)} />
                            <Icon name='search' type="ionicons" color='#aac' />
                        </View>
                    </View>
                    {(message &&
                        <View style={styles.messageView}>
                            <Text style={[styles.messageText, { color: color }]}>
                                {message}</Text>
                            <Image
                                source={require('../Images/logo.png')}
                                resizeMode='contain'
                                style={styles.messageImage} />
                        </View>)
                        ||
                        <View>
                            <View style={GeneralStyles.headerView}>
                                <Text style={GeneralStyles.headerText}>{`Found ${this.state.list.length.toString()} Locations...`}</Text>
                            </View>
                            {this.state.list.map((location, index) =>
                                <View key={index} style={{ flex: 1, alignContent: 'column' }}>
                                    <TouchableHighlight
                                        underlayColor='#afa'
                                        style={{ flex: 1 }}
                                        onPress={() => this.update(location)}>
                                        <View style={styles.singleLocation}>
                                            <Icon
                                                name='forward'
                                                color='#393'
                                                size={15} />
                                            <Text> {location.Name}</Text>
                                        </View>
                                    </TouchableHighlight>
                                    <Icon name='pencil' color='#448' size={35} onPress={() => this.edit(location)} />
                                </View>)
                            }
                        </View>
                    }
                </ScrollView>
            </View>
        </View>;
    }
}
const styles = StyleSheet.create({
    messageView: {
        alignItems: 'center'
    },
    messageText: {
        fontSize: 16,
        marginBottom: '20%',
        marginLeft: '5%',
    },
    messageImage: {
        width: 150,
        height: 150
    },
    singleLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        padding: 10
    },
});