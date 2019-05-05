import React from 'react';
import {
    ScrollView,
    View,
    Text,
    Image,
    TextInput,
    TouchableHighlight,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import SideMenu from '../Components/SideMenu';
import DataUtils from '../../Code/Data/DataUtils';
import Settings from '../../Code/Settings';
import { GeneralStyles } from '../styles';

export default class FindLocation extends React.PureComponent {
    static navigationOptions = {
        title: 'Change your Location',
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
            searching: false,
            locationName: this.appData.Settings.location.Name,
        };
        this.findLocation = this.findLocation.bind(this);
        this.locationWasEdited = this.locationWasEdited.bind(this);
        this.editSingleLocation = this.editSingleLocation.bind(this);
    }
    async update(location) {
        const appData = this.appData;
        if (appData.Settings.location.locationId !== location.locationId) {
            await Settings.setCurrentLocation(location);
            appData.Settings.location = location;
            if (this.onUpdate) {
                this.onUpdate(appData);
            }
        }
        this.dispatch(NavigationActions.back());
    }
    editSingleLocation(location) {
        const { appData, locationWasEdited } = this;
        this.navigate('NewLocation', {
            appData,
            location,
            onUpdate: locationWasEdited,
        });
    }
    locationWasEdited(appData, location) {
        this.setState({ locationName: appData.Settings.location.Name });
        //If the changed/added location is being set as the current location
        if (location.locationId === appData.Settings.location.locationId) {
            if (this.onUpdate) {
                this.onUpdate(appData);
            }
            this.dispatch(NavigationActions.back());
        } else {
            if (this.searchText) {
                //Refresh the search - the changed location may be in the results and may have had a name change
                this.findLocation(this.searchText);
            } else {
                //Show the edited location in the results
                this.findLocation(location.name);
            }
        }
    }
    findLocation(search) {
        if (search) {
            this.searchText = search;
        } else {
            search = this.searchText;
        }
        if (search) {
            this.setState({ searching: true });
            DataUtils.SearchLocations(search).then(list =>
                this.setState({
                    searching: false,
                    list: list,
                })
            );
        }
    }
    getMessage() {
        if (this.state.list === null) {
            //initial state of the screen
            return (
                <View style={{ alignItems: 'center', marginBottom: '20%' }}>
                    <Text
                        style={{
                            color: '#77b',
                            fontSize: 16,
                            marginTop: '5%',
                        }}>
                        Your current location is:
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            this.editSingleLocation(
                                this.appData.Settings.location
                            )
                        }>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontWeight: 'bold', color: '#55f' }}>
                                {`${this.state.locationName}  `}
                            </Text>
                            <Icon name="edit" color="#888" size={13} />
                        </View>
                    </TouchableOpacity>
                </View>
            );
        } else if (this.state.list.length === 0) {
            //After a search with no results
            return (
                <Text style={[styles.messageText, { color: '#b66' }]}>
                    There are no Locations in the list that match your search...
                </Text>
            );
        } else if (this.state.searching) {
            //During a search
            return (
                <Text style={[styles.messageText, { color: '#595' }]}>
                    Searching for locations...
                </Text>
            );
        }
    }

    render() {
        const message = this.getMessage();

        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.appData}
                        navigator={this.props.navigation}
                    />
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }}>
                            <View style={GeneralStyles.formRow}>
                                <Text style={GeneralStyles.label}>
                                    Search Location List
                                </Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                        style={[
                                            GeneralStyles.textInput,
                                            { width: '85%' },
                                        ]}
                                        placeholder="Enter search text..."
                                        accessibilityLabel="Search for a location"
                                        autoCorrect={false}
                                        spellCheck={false}
                                        onEndEditing={event =>
                                            this.findLocation(
                                                event.nativeEvent.text
                                            )
                                        }
                                    />
                                    <Icon
                                        name="search"
                                        type="ionicons"
                                        color="#aac"
                                    />
                                </View>
                            </View>
                            {(message && (
                                <View style={styles.messageView}>
                                    {message}
                                    <Image
                                        source={require('../Images/logo.png')}
                                        resizeMode="contain"
                                        style={styles.messageImage}
                                    />
                                </View>
                            )) || (
                                <View>
                                    <View style={GeneralStyles.headerView}>
                                        <Text
                                            style={
                                                GeneralStyles.headerText
                                            }>{`Found ${this.state.list.length.toString()} Locations...`}</Text>
                                    </View>
                                    {this.state.list.map((location, index) => (
                                        <View
                                            key={index}
                                            style={styles.singleLocation}>
                                            <TouchableHighlight
                                                underlayColor="#afa"
                                                onPress={() =>
                                                    this.update(location)
                                                }
                                                style={styles.locationLink}>
                                                <View
                                                    style={
                                                        GeneralStyles.centeredRow
                                                    }>
                                                    <Icon
                                                        name="forward"
                                                        color="#393"
                                                        size={15}
                                                    />
                                                    <Text>
                                                        {' '}
                                                        {location.Name}
                                                    </Text>
                                                </View>
                                            </TouchableHighlight>
                                            <Icon
                                                name="edit"
                                                color="#888"
                                                size={15}
                                                containerStyle={{
                                                    paddingRight: 12,
                                                    paddingLeft: 12,
                                                }}
                                                onPress={() =>
                                                    this.editSingleLocation(
                                                        location
                                                    )
                                                }
                                            />
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            onPress={() =>
                                this.navigate('NewLocation', {
                                    appData: this.appData,
                                    onUpdate: this.locationWasEdited,
                                })
                            }>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#eee',
                                }}>
                                <Icon
                                    size={11}
                                    reverse
                                    name="add"
                                    color="#585"
                                />
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: '#262',
                                    }}>
                                    Add a New Location
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    messageView: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageText: {
        fontSize: 16,
        marginTop: '5%',
        marginBottom: '20%',
        textAlign: 'center',
    },
    messageImage: {
        width: 150,
        height: 150,
    },
    singleLocation: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#eee',
        padding: 5,
    },
    locationLink: {
        flex: 1,
        backgroundColor: '#f5f7f5',
        padding: 5,
    },
});
