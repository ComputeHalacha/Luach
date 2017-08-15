import React, { Component } from 'react';
import { ScrollView, View, Alert, Switch, Text, TouchableHighlight } from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import CustomList from '../Components/CustomList';
import DataUtils from '../../Code/Data/DataUtils';
import AppData from '../../Code/Data/AppData';
import { warn, error, popUpMessage } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class KavuahScreen extends Component {
    static navigationOptions = {
        title: 'List of Kavuahs'
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { params } = this.props.navigation.state,
            appData = params.appData;
        this.onUpdate = params.onUpdate;
        this.state = {
            appData: appData,
            kavuahList: appData.Settings.showIgnoredKavuahs ?
                appData.KavuahList : appData.KavuahList.filter(k => !k.ignore),
            showIgnored: false
        };
        this.deleteKavuah = this.deleteKavuah.bind(this);
        this.findKavuahs = this.findKavuahs.bind(this);
        this.newKavuah = this.newKavuah.bind(this);
        this.toggleIgnored = this.toggleIgnored.bind(this);
        this.changeActive = this.changeActive.bind(this);
        this.changeIgnore = this.changeIgnore.bind(this);
        this.changeCancelsOb = this.changeCancelsOb.bind(this);
        this.update = this.update.bind(this);
        this.saveAndUpdate = this.saveAndUpdate.bind(this);
    }
    update(appData) {
        //To cause an update on setState for the FlatList (used in CustomList),
        //the data source needs to be changed at a "shallow" level.
        const kavuahList = [...appData.KavuahList];
        this.setState({
            appData: appData,
            kavuahList: appData.Settings.showIgnoredKavuahs ?
                kavuahList : kavuahList.filter(k => !k.ignore)
        });
        if (this.onUpdate) {
            this.onUpdate(appData);
        }
    }
    saveAndUpdate(kavuah) {
        DataUtils.KavuahToDatabase(kavuah).catch(err => {
            warn('Error trying to update kavuah into the database.');
            error(err);
        });
        AppData.getAppData().then(appData => {
            this.update(appData);
        });
    }
    newKavuah() {
        this.navigate('NewKavuah', {
            appData: this.state.appData,
            onUpdate: this.update
        });
    }
    toggleIgnored() {
        const appData = this.state.appData,
            showIgnored = this.state.appData.Settings.showIgnoredKavuahs;
        appData.Settings.showIgnoredKavuahs = !showIgnored;
        appData.Settings.save();
        if (showIgnored) {
            this.setState({
                kavuahList: appData.KavuahList.filter(k => !k.ignore),
                appData: appData
            });
        }
        else {
            this.setState({
                kavuahList: appData.KavuahList,
                appData: appData
            });
        }
    }
    deleteKavuah(kavuah) {
        Alert.alert(
            'Confirm Kavuah Removal',
            'Are you sure that you want to remove this Kavuah?',
            [   //Button 1
                {
                    text: 'Cancel',
                    onPress: () => { return; },
                    style: 'cancel'
                },
                //Button 2
                {
                    text: 'OK', onPress: () => {
                        DataUtils.DeleteKavuah(kavuah)
                            .then(() => {
                                AppData.getAppData().then(appData => {
                                    this.update(appData);
                                    popUpMessage(`The kavuah of ${kavuah.toString()} has been successfully removed.`,
                                        'Remove Kavuah');
                                    this.setState({
                                        appData: appData,
                                        kavuahList: appData.Settings.showIgnoredKavuahs ?
                                            appData.KavuahList : appData.KavuahList.filter(k => !k.ignore)
                                    });
                                    this.update(appData);
                                });
                            })
                            .catch(err => {
                                warn('Error trying to delete a kavuah from the database.');
                                error(err);
                            });
                    }
                }
            ]);
    }
    findKavuahs() {
        this.navigate('FindKavuahs', {
            appData: this.state.appData,
            onUpdate: this.update
        });
    }
    changeActive(kavuah, active) {
        kavuah.active = active;
        this.saveAndUpdate(kavuah);
    }
    changeIgnore(kavuah, ignore) {
        kavuah.ignore = ignore;
        this.saveAndUpdate(kavuah);
    }
    changeCancelsOb(kavuah, cancelsOnahBeinunis) {
        const doChange = () => {
            kavuah.cancelsOnahBeinunis = cancelsOnahBeinunis;
            this.saveAndUpdate(kavuah);
        };
        if (!cancelsOnahBeinunis) {
            doChange();
            return;
        }
        //Search for another Kavuah already set to Cancel Onah Beinunis.
        //There can be only one.
        const prevCancels = this.state.kavuahList.find(k =>
            k.cancelsOnahBeinunis);

        //If if there are no other canceling Kavuahs
        if (!prevCancels) {
            doChange();
            return;
        }
        else {
            Alert.alert(
                'Cancel Onah Beinunis',
                'A different Kavuah, "' + prevCancels.toString() + '" has been previously set to Cancel Onah Beinunis.\n' +
                'Setting it for this Kavuah will remove it from the the other Kavuah.\n' +
                'Do you wish to proceed?',
                [   //Button 1
                    {
                        text: 'Cancel',
                        onPress: () => { return; },
                        style: 'cancel'
                    },
                    //Button 2
                    {
                        text: 'Proceed',
                        onPress: () => {
                            prevCancels.cancelsOnahBeinunis = false;
                            DataUtils.KavuahToDatabase(prevCancels).catch(err => {
                                warn('Error trying to update kavuah into the database.');
                                error(err);
                            });
                            doChange();
                        }
                    }
                ]);
        }
    }
    render() {
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.state.appData}
                        navigator={this.props.navigation}
                        hideKavuahs={true}
                        helpUrl='Kavuahs.html'
                        helpTitle='Kavuahs' />
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }}>
                            <View style={[GeneralStyles.buttonList, GeneralStyles.headerButtons]}>
                                <TouchableHighlight onPress={this.newKavuah}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            size={9}
                                            reverse
                                            name='add'
                                            color='#484' />
                                        <Text style={{
                                            fontSize: 9,
                                            color: '#262',
                                            fontStyle: 'italic'
                                        }}>New Kavuah</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight onPress={this.findKavuahs}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            size={9}
                                            reverse
                                            name='search'
                                            color='#669' />
                                        <Text style={{
                                            fontSize: 9,
                                            color: '#669',
                                            fontStyle: 'italic'
                                        }}>Calculate Possible Kavuahs</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                            {this.state.appData.KavuahList.some(k => k.ignore) &&
                                <TouchableHighlight onPress={this.toggleIgnored} style={{ flex: 0 }} underlayColor='#aaa'>
                                    <View style={{ backgroundColor: '#f5f5f5', padding: 5, borderBottomWidth: 1, borderColor: '#ccc' }}>
                                        <Text style={{ textAlign: 'center', color: '#77d' }}>
                                            {(this.state.appData.Settings.showIgnoredKavuahs ? 'Hide' : 'Show') + ' Ignored Kavuahs'}</Text>
                                    </View>
                                </TouchableHighlight>
                            }
                            <CustomList
                                data={this.state.kavuahList}
                                title={kavuah => kavuah.toLongString()}
                                iconName='device-hub'
                                iconColor={kavuah => kavuah.active ? '#99f' : '#ddd'}
                                keyExtractor={(item, index) => item.kavuahId || index.toString()}
                                emptyListText='There are no Kavuahs in the list'
                                secondSection={kavuah => <View style={GeneralStyles.inItemButtonList}>
                                    <View style={{ flex: 1, alignItems: 'center', }}>
                                        <Switch value={kavuah.active}
                                            onValueChange={value =>
                                                this.changeActive(kavuah, value)}
                                            title='Active' />
                                        <Text style={GeneralStyles.inItemLinkText}>Active</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center', }}>
                                        <Switch value={kavuah.cancelsOnahBeinunis}
                                            onValueChange={value =>
                                                this.changeCancelsOb(kavuah, value)}
                                            title='Active' />
                                        <Text style={GeneralStyles.inItemLinkText}>Cancels Onah Beinonis</Text>
                                    </View>
                                    {this.state.showIgnored &&
                                        <View style={{ flex: 1, alignItems: 'center', }}>
                                            <Switch value={kavuah.ignore}
                                                onValueChange={value =>
                                                    this.changeIgnore(kavuah, value)}
                                                title='Ignore' />
                                            <Text style={GeneralStyles.inItemLinkText}>Ignored</Text>
                                        </View>
                                    }
                                    <TouchableHighlight
                                        underlayColor='#faa'
                                        style={{ flex: 1, }}
                                        onPress={() => this.deleteKavuah(kavuah)}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Icon
                                                name='delete-forever'
                                                color='#faa'
                                                size={20} />
                                            <Text style={GeneralStyles.inItemLinkText}>Remove</Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>}
                            />
                        </ScrollView>
                    </View>
                </View>
            </View >);
    }
}