import React, { Component } from 'react';
import { ScrollView, Text, View, TouchableHighlight, TouchableOpacity, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import CustomList from '../Components/CustomList';
import DataUtils from '../../Code/Data/DataUtils';
import { UserOccasionTypes, UserOccasion } from '../../Code/JCal/UserOccasion';
import { warn, error, popUpMessage, getTodayJdate } from '../../Code/GeneralUtils';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

let today;
function getToday(appData) {
    if (!today) {
        today = getTodayJdate(appData);
    }
    return today;
}
export default class OccasionsScreen extends Component {
    static doUpdate = null;
    static navigationOptions = ({ navigation }) => {
        const { appData } = navigation.state.params;
        return {
            title: 'Events / Occasions',
            headerRight: <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableHighlight
                    onPress={() =>
                        navigation.navigate('ExportData', { appData, dataSet: 'Events' })}>
                    <View style={{ marginRight: 10, alignItems: 'center' }}>
                        <Icon name='import-export'
                            color='#aca'
                            size={25} />
                        <Text style={{ fontSize: 10, color: '#797' }}>Export Data</Text>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight
                    onPress={() =>
                        navigation.navigate('NewOccasion', {
                            appData: appData,
                            onUpdate: OccasionsScreen.doUpdate,
                            jdate: getToday(appData)
                        })}>
                    <View style={{ marginRight: 3 }}>
                        <Icon name='add'
                            color='#aac'
                            size={25} />
                        <Text style={{ fontSize: 10, color: '#aac' }}>New Event</Text>
                    </View>
                </TouchableHighlight>
            </View>
        };
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { appData, onUpdate } = this.props.navigation.state.params;
        this.onUpdate = onUpdate;
        this.state = {
            appData: appData,
            occasionList: (appData && appData.UserOccasions) || []
        };

        this.editOccasion = this.editOccasion.bind(this);
        this.deleteOccasion = this.deleteOccasion.bind(this);
        this.update = this.update.bind(this);
        this.getYearText = this.getYearText.bind(this);
    }

    editOccasion(occasion) {
        this.navigate('NewOccasion',
            {
                occasion,
                appData: this.state.appData,
                onUpdate: OccasionsScreen.doUpdate
            });
    }
    deleteOccasion(occasion) {
        Alert.alert(
            'Confirm Event Removal', 'Are you sure that you want to remove this Event?', [
                //Button 1
                {
                    text: 'Cancel',
                    onPress: () => { return; },
                    style: 'cancel'
                },
                //Button 2
                {
                    text: 'OK', onPress: () => {
                        DataUtils.DeleteUserOccasion(occasion).then(() => {
                            const appData = this.state.appData;
                            let occasionList = appData.UserOccasions,
                                index = occasionList.indexOf(occasion);
                            if (index > -1) {
                                occasionList.splice(index, 1);
                                appData.UserOccasions = occasionList;
                                OccasionsScreen.doUpdate(appData);
                                popUpMessage(`The Event "${occasion.title}" has been successfully removed.`,
                                    'Remove Event');
                            }
                        }
                        ).catch(err => {
                            warn('Error trying to delete an occasion from the database.');
                            error(err);
                            popUpMessage('We are sorry, Luach is unable to remove this Event.\nPlease contact luach@compute.co.il.');
                        });
                    }
                }]);
    }
    update(appData) {
        //sort occasions by date
        appData.UserOccasions = UserOccasion.sortList(appData.UserOccasions);

        if (this.onUpdate) {
            this.onUpdate(appData);
        }
        this.setState({
            appData: appData,
            //forces a refresh
            occasionList: [...appData.UserOccasions]
        });
    }
    getYearText(occ) {
        const yearText = occ.getYearString(getToday(this.state.appData));
        if (yearText) {
            return <Text style={{
                color: '#ffe',
                fontSize: 10,
                fontStyle: 'italic',
                paddingTop: 2,
                marginLeft: 4
            }
            }>
                {yearText}
            </Text>;
        }
        else {
            return null;
        }
    }
    render() {
        OccasionsScreen.doUpdate = this.update;
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={OccasionsScreen.doUpdate}
                        appData={this.state.appData}
                        navigator={this.props.navigation}
                        hideOccasions={true}
                        helpUrl='Events.html'
                        helpTitle='Events' />
                    <ScrollView style={{ flex: 1 }}>
                        <CustomList
                            data={this.state.occasionList}
                            iconname='event'
                            emptyListText='There are no Events in the list'
                            keyExtractor={(item, index) => item.occasionId.toString() || index.toString()}
                            title={occasion => {
                                const currentYear = occasion.getCurrentYear();
                                return <View>
                                    <TouchableOpacity
                                        onPress={() => this.editOccasion(occasion)}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: 5,
                                            borderRadius: 5,
                                            margin: 4,
                                            backgroundColor: occasion.color
                                        }}>
                                            <Icon size={14} color='#ffe' name='event' />
                                            <Text style={{
                                                color: '#ffe',
                                                paddingLeft: 2,
                                                fontWeight: 'bold',
                                                fontSize: 12,
                                                marginLeft: 4
                                            }}>
                                                {occasion.title}
                                            </Text>
                                            {currentYear &&
                                                <Text style={{
                                                    marginLeft: 4,
                                                    marginTop: 2,
                                                    color: '#ffe',
                                                    fontStyle: 'italic',
                                                    fontSize: 9
                                                }}>
                                                    {Utils.toSuffixed(currentYear) + ' year'}
                                                </Text>
                                            }
                                        </View>
                                    </TouchableOpacity>
                                    <Text>
                                        {occasion.toString()}
                                    </Text>
                                </View>;
                            }}
                            secondSection={occasion => <View style={GeneralStyles.inItemButtonList}>
                                <TouchableHighlight
                                    underlayColor='#696'
                                    style={{ flex: 1 }}
                                    onPress={() => this.navigate('Home', {
                                        currDate: occasion.jdate,
                                        appData: this.state.appData
                                    })}>
                                    <View style={GeneralStyles.center}>
                                        <Icon
                                            name='event-note'
                                            color='#696'
                                            size={18}
                                            containerStyle={GeneralStyles.inItemLinkIcon} />
                                        <Text style={GeneralStyles.inItemLinkText}> Go to Date</Text>
                                    </View>
                                </TouchableHighlight>
                                {occasion.occasionType !== UserOccasionTypes.OneTime &&
                                    <TouchableHighlight
                                        underlayColor='#66a'
                                        style={{ flex: 1 }}
                                        onPress={() => this.navigate('Home', {
                                            currDate: occasion.getNextInstance(),
                                            appData: this.state.appData
                                        })}>
                                        <View style={GeneralStyles.center}>
                                            <Icon
                                                name='near-me'
                                                color='#66a'
                                                size={18}
                                                containerStyle={GeneralStyles.inItemLinkIcon} />
                                            <Text style={GeneralStyles.inItemLinkText}> Next Occurence</Text>
                                        </View>
                                    </TouchableHighlight>
                                }
                                <TouchableHighlight
                                    underlayColor='#788778'
                                    style={{ flex: 1 }}
                                    onPress={() => this.editOccasion(occasion)}>
                                    <View style={GeneralStyles.center}>
                                        <Icon
                                            name='edit'
                                            color='#99a999'
                                            size={18}
                                            containerStyle={GeneralStyles.inItemLinkIcon} />
                                        <Text style={GeneralStyles.inItemLinkText}>Edit</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    underlayColor='#faa'
                                    style={{ flex: 1 }}
                                    onPress={() => this.deleteOccasion(occasion)}>
                                    <View style={GeneralStyles.center}>
                                        <Icon
                                            name='delete-forever'
                                            color='#faa'
                                            size={18}
                                            containerStyle={GeneralStyles.inItemLinkIcon} />
                                        <Text style={GeneralStyles.inItemLinkText}> Remove</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>} />
                    </ScrollView>
                </View>
            </View>);
    }
}