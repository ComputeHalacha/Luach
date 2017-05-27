import React, { Component } from 'react';
import { ScrollView, View, Alert, Switch, Text, TouchableHighlight } from 'react-native';
import SideMenu from './SideMenu';
import CustomList from './CustomList';
import { Icon } from 'react-native-elements';
import DataUtils from '../Code/Data/DataUtils';
import { warn, error, popUpMessage } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';

export default class KavuahScreen extends Component {
    static navigationOptions = {
        title: 'List of Kavuahs',
        right: <Icon name='add-circle' onPress={this.newKavuah} />,
    };
    constructor(props) {
        super(props);

        this.navigate = this.props.navigation.navigate;

        const { params } = this.props.navigation.state,
            appData = params.appData;
        this.onUpdate = params.onUpdate;
        this.state = {
            appData: appData,
            kavuahList: appData.KavuahList.filter(k => !k.ignore),
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
        this.setState({
            appData: appData,
            kavuahList: appData.KavuahList
        });
        if (this.onUpdate) {
            this.onUpdate(appData);
        }
    }
    saveAndUpdate(kavuah) {
        DataUtils.KavuahToDatabase(kavuah);

        const appData = this.state.appData,
            kavuahList = appData.KavuahList;
        //To cause an update on setState for the FlatList (used in CustomList),
        //the data source needs to be changed at a "shallow" level.
        appData.KavuahList = [...kavuahList];
        this.update(appData);
    }
    newKavuah() {
        this.navigate('NewKavuah', {
            appData: this.state.appData,
            onUpdate: this.update
        });
    }
    toggleIgnored() {
        const appData = this.state.appData;
        if (this.state.showIgnored) {
            this.setState({
                kavuahList: appData.KavuahList.filter(k => !k.ignore),
                showIgnored: false
            });
        }
        else {
            this.setState({
                kavuahList: appData.KavuahList,
                showIgnored: true
            });
        }
    }
    deleteKavuah(kavuah) {
        const appData = this.state.appData;
        let kavuahList = appData.KavuahList,
            index = kavuahList.indexOf(kavuah);
        if (index > -1 || kavuah.hasId) {
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
                            if (kavuah.hasId) {
                                DataUtils.DeleteKavuah(kavuah).catch(err => {
                                    warn('Error trying to delete a kavuah from the database.');
                                    error(err);
                                });
                            }
                            if (index > -1) {
                                kavuahList.splice(index, 1);
                                appData.KavuahList = kavuahList;
                                this.update(appData);
                            }
                            popUpMessage(`The kavuah of ${kavuah.toString()} has been successfully removed.`,
                                'Remove kavuah');
                        }
                    }
                ]);
        }
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
        kavuah.cancelsOnahBeinunis = cancelsOnahBeinunis;
        this.saveAndUpdate(kavuah);
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
                        hideMonthView={true} />
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }}>
                            <View style={[GeneralStyles.buttonList, GeneralStyles.headerButtons]}>
                                <TouchableHighlight onPress={this.newKavuah}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            size={12}
                                            reverse
                                            name='add'
                                            color='#484' />
                                        <Text style={{
                                            fontSize: 12,
                                            color: '#262',
                                            fontStyle: 'italic'
                                        }}>New Kavuah</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight onPress={this.findKavuahs}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            size={12}
                                            reverse
                                            name='search'
                                            color='#669' />
                                        <Text style={{
                                            fontSize: 12,
                                            color: '#669',
                                            fontStyle: 'italic'
                                        }}>Calculate Possible Kavuahs</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                            <CustomList
                                data={this.state.kavuahList}
                                title={kavuah => kavuah.toLongString()}
                                iconName='device-hub'
                                iconColor={kavuah => kavuah.active ? '#99f' : '#ddd'}
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
                        {this.state.appData.KavuahList.some(k => k.ignore) &&
                            <View style={{ flex: 0, backgroundColor: '#eef', padding: 5, borderTopWidth: 2, borderColor: '#ccd' }}>
                                <TouchableHighlight onPress={this.toggleIgnored}>
                                    <Text style={{ textAlign: 'center', color: '#55f' }}>
                                        {(this.state.showIgnored ? 'Hide' : 'Show') + ' Ignored Kavuahs'}</Text>
                                </TouchableHighlight>
                            </View>
                        }
                    </View>
                </View>
            </View >);
    }
}