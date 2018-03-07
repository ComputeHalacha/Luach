import React from 'react';
import { ScrollView, View, Text, Image, TextInput, TouchableHighlight, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import SideMenu from '../Components/SideMenu';
import { popUpMessage } from '../../Code/GeneralUtils';
import DataUtils from '../../Code/Data/DataUtils';
import Settings from '../../Code/Settings';
import { GeneralStyles } from '../styles';

export default class FindLocation extends React.PureComponent {
    static navigationOptions = {
        title: 'Change your Location'
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
    getMessage() {
        if (this.state.list === null) {
            //initial state of the screen
            return <View style={{ alignItems: 'center', marginBottom: '20%' }}>
                <Text style={{ color: '#77b', fontSize: 16, marginTop: '5%' }}>
                    Your current location is:
                    </Text>
                <TouchableOpacity onPress={() => this.edit(this.appData.Settings.location)}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', color: '#55f' }}>
                            {`${this.appData.Settings.location.Name}  `}
                        </Text>
                        <Icon name='edit' color='#888' size={13} />
                    </View>
                </TouchableOpacity>
            </View>;
        }
        else if (this.state.list.length === 0) {
            //After a search with no results
            return <Text style={[styles.messageText, { color: '#b66' }]}>
                There are no Locations in the list that match your search...
            </Text>;
        }
        else if (this.state.searching) {
            //During a search
            return <Text style={[styles.messageText, { color: '#595' }]}>
                Searching for locations...
            </Text>;
        }
    }

    render() {
        const message = this.getMessage();

        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.appData}
                    navigator={this.props.navigation} />
                <View style={{ flex: 1 }}>
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
                                {message}
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
                                    <View key={index} style={{ flex: 1 }}>
                                        <TouchableHighlight
                                            underlayColor='#afa'
                                            onPress={() => this.update(location)}>
                                            <View style={styles.singleLocation}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Icon
                                                        name='forward'
                                                        color='#393'
                                                        size={15} />
                                                    <Text> {location.Name}</Text>
                                                </View>
                                                <Icon name='edit' color='#888' size={13} style={{ margin: 5 }} onPress={() => this.edit(location)} />
                                            </View>
                                        </TouchableHighlight>
                                    </View>)
                                }
                            </View>
                        }
                    </ScrollView>
                    <TouchableOpacity onPress={() =>
                        this.navigate('NewLocation', { appData: this.appData })}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#eee'
                        }}>
                            <Icon
                                size={11}
                                reverse
                                name='add'
                                color='#585' />
                            <Text style={{
                                fontSize: 13,
                                color: '#262'
                            }}>Add a New Location</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>;
    }
}
const styles = StyleSheet.create({
    messageView: {
        alignItems: 'center',
        justifyContent:'center'
    },
    messageText: {
        fontSize: 16,
        marginTop: '5%',
        marginBottom: '20%',
        textAlign:'center'
    },
    messageImage: {
        width: 150,
        height: 150
    },
    singleLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#eee',
        padding: 10
    },
});