import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableHighlight } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Icon } from 'react-native-elements';
import SideMenu from '../Components/SideMenu';
import DataUtils from '../../Code/Data/DataUtils';
import { Kavuah } from '../../Code/Chashavshavon/Kavuah';
import { popUpMessage } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class FindKavuahScreen extends Component {
    static navigationOptions = {
        title: 'Found Possible Kavuahs'
    };
    constructor(props) {
        super(props);

        this.dispatch = this.props.navigation.dispatch;
        this.navigate = this.props.navigation.navigate;

        const { appData, onUpdate, possibleKavuahList } = this.props.navigation.state.params;

        this.onUpdate = onUpdate;
        this.listSupplied = !!possibleKavuahList;
        this.state = {
            appData: appData,
            possibleKavuahList: possibleKavuahList || []
        };

        this.update = this.update.bind(this);
        this.addKavuah = this.addKavuah.bind(this);
        this.removePossibleKavuah = this.removePossibleKavuah.bind(this);
        this.ignorePossibleKavuah = this.ignorePossibleKavuah.bind(this);
    }
    componentWillMount() {
        const appData = this.state.appData;
        if (appData && !this.listSupplied) {
            const possList = Kavuah.getPossibleNewKavuahs(
                appData.EntryList.realEntrysList,
                appData.KavuahList,
                appData.Settings);
            this.setState({
                possibleKavuahList: possList
            });
            if (possList.length === 0) {
                popUpMessage('The application did not find any Kavuah combinations.\nPlease remember: DO NOT RELY EXCLUSIVELY UPON THIS APPLICATION!');
                this.dispatch(NavigationActions.back());
            }
        }
    }
    addKavuah(pk) {
        const appData = this.state.appData,
            kList = appData.KavuahList,
            foundInList = kList.find(k => k.isMatchingKavuah(pk.kavuah)),
            kavuah = foundInList || pk.kavuah;

        //In case it was already in the list, but was inactive or ignored.
        kavuah.active = true;
        kavuah.ignore = false;

        DataUtils.KavuahToDatabase(kavuah).then(() => {
            if (!foundInList) {
                kList.push(pk.kavuah);
            }
            appData.KavuahList = kList;
            popUpMessage(`The Kavuah ${kavuah.toString()} has been added to the list`);
            //Now that it's been added to the database, it is no longer a "possible"" Kavuah.
            this.update(appData);
            this.removePossibleKavuah(pk);
        });
    }
    ignorePossibleKavuah(pk) {
        const appData = this.state.appData,
            kList = appData.KavuahList,
            foundInList = kList.find(k => k.isMatchingKavuah(pk.kavuah)),
            kavuah = foundInList || pk.kavuah;

        kavuah.active = true;
        kavuah.ignore = true;

        DataUtils.KavuahToDatabase(kavuah).then(() => {
            if (!foundInList) {
                kList.push(pk.kavuah);
            }
            appData.KavuahList = kList;
            //Now that it's been added to the database, it is no longer a "possible"" Kavuah.
            this.update(appData);
            this.removePossibleKavuah(pk);
        });
    }
    removePossibleKavuah(pk) {
        let list = this.state.possibleKavuahList,
            index = list.indexOf(pk);
        if (index > -1) {
            list.splice(index, 1);
            if (list.length === 0) {
                this.navigate('Kavuahs', { onUpdate: this.onUpdate, appData: this.state.appData });
            }
            else {
                this.setState({
                    possibleKavuahList: list
                });
            }
        }
    }
    update(appData) {
        if (appData) {
            this.setState({ appData: appData });
        }
        if (this.onUpdate) {
            this.onUpdate(appData);
        }
    }
    render() {
        const pk = this.state.possibleKavuahList.length > 0 &&
            this.state.possibleKavuahList[0];
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.state.appData}
                    navigator={this.props.navigation}
                    hideOccasions={true}
                    hideSettings={true}
                    helpUrl='Kavuahs.html'
                    helpTitle='Kavuahs' />
                <ScrollView style={{ flex: 1 }}>
                    {(pk &&
                        <View style={{ alignItems: 'center' }}>
                            <Icon name='device-hub'
                                size={70}
                                color='#f00' />
                            <Text style={{ padding: 15, fontWeight: 'bold', fontSize: 15, color: '#f00', flexWrap: 'wrap' }}>
                                {'POSSIBLE KAVUAH FOUND'}</Text>
                            <Text style={{ fontWeight: 'bold', color: '#669', marginBottom: 20, flexWrap: 'wrap', textAlign: 'center' }}>
                                {pk.kavuah.toString()}</Text>
                            <View style={{ marginBottom: 10, padding: 10, backgroundColor: '#f5f5ff', borderRadius: 6 }}>
                                <Text style={{ color: '#686', fontWeight: 'bold', fontSize: 10, alignSelf: 'center' }}>
                                    Entries used for this calculatation:</Text>
                                {pk.entries.map((e, i) =>
                                    <Text key={i} style={{ fontSize: 11, color: '#655', paddingLeft: 10 }}>
                                        {`${(i + 1).toString()}. ${e.toString()}`}</Text>)
                                }
                            </View>
                            <View style={GeneralStyles.inItemButtonList}>
                                <TouchableHighlight
                                    underlayColor='#aaf'
                                    style={{ flex: 1 }}
                                    onPress={() => this.addKavuah(pk)}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            reverse
                                            name='add'
                                            color='#696'
                                            size={15} />
                                        <Text style={{ color: '#080', textAlign: 'center', fontSize: 10 }}>Add Kavuah</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    underlayColor='#aaa'
                                    style={{ flex: 1 }}
                                    onPress={() => this.removePossibleKavuah(pk)}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            reverse
                                            name='delete-forever'
                                            color='#aaa'
                                            size={15} />
                                        <Text style={{ color: '#aaa', textAlign: 'center', fontSize: 10 }}>Don't Add Now</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    underlayColor='#faa'
                                    style={{ flex: 1 }}
                                    onPress={() => this.ignorePossibleKavuah(pk)}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Icon
                                            reverse
                                            name='delete-forever'
                                            color='#faa'
                                            size={15} />
                                        <Text style={{ color: '#faa', textAlign: 'center', fontSize: 10 }}>Always Ignore</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                            <View style={{ marginTop: 10, padding: 10 }}>
                                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Explanation</Text>
                                <Text style={{ fontStyle: 'italic', marginTop: 8 }}>Don't Add Now</Text>
                                <Text>This option should be chosen if you are not yet sure whether or not
                                    to add this Kavuah. The next time the list of Entries is checked for
                                    possible Kavuahs, this Kavuah will be shown again as a possible Kavuah.</Text>
                                <Text style={{ fontStyle: 'italic', marginTop: 8 }}>Always Ignore</Text>
                                <Text>This option should be chosen if you are sure that the above suggested Kavuah;
                                    which was calulated from those Entries listed above, should not be added.
                                    It will not show up again as a possible Kavuah when the list of
                                    Entries is searched for possible Kavuahs.</Text>
                            </View>
                        </View>)}
                </ScrollView>
            </View>
        </View>;
    }
}