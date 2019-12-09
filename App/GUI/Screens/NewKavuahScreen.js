import React from 'react';
import { ScrollView, View, Text, Switch, Button, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';
import SideMenu from '../Components/SideMenu';
import KavuahPickers from '../Components/KavuahPickers';
import { KavuahTypes, Kavuah } from '../../Code/Chashavshavon/Kavuah';
import DataUtils from '../../Code/Data/DataUtils';
import { popUpMessage, warn, error, GLOBALS } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class NewKavuah extends React.Component {
    static navigationOptions = {
        title: 'New Kavuah',
    };
    constructor(props) {
        super(props);
        const navigation = this.props.navigation;
        let { appData, onUpdate, settingEntry } = navigation.state.params;
        this.onUpdate = onUpdate;
        this.dispatch = navigation.dispatch;
        //We work with a (time descending) list of cloned entries
        //to prevent the "real" entries from becoming immutable
        this.listOfEntries = (appData.EntryList && appData.EntryList.length)
            ? appData.EntryList.descending.map(e => e.clone())
            : [];
        this.appData = appData;
        if (settingEntry) {
            settingEntry = this.listOfEntries.find(e =>
                e.isSameEntry(settingEntry)
            );
        } else if (this.listOfEntries.length > 0) {
            settingEntry = this.listOfEntries[ 0 ];
        }

        this.state = {
            settingEntry: settingEntry,
            kavuahType: KavuahTypes.Haflagah,
            specialNumber: settingEntry && settingEntry.haflaga,
            cancelsOnahBeinunis: false,
            active: true,
        };
        this.getSpecialNumberFromEntry = this.getSpecialNumberFromEntry.bind(
            this
        );
        this.getSpecialNumberFromKavuahType = this.getSpecialNumberFromKavuahType.bind(
            this
        );
    }
    componentWillMount() {
        if (!this.state.settingEntry) {
            popUpMessage(
                'Kavuahs can only be added after an Entry has been added!'
            );
            this.dispatch(NavigationActions.back());
        }
    }
    addKavuah() {
        if (!this.state.specialNumber) {
            popUpMessage(
                'The number for the "' +
                Kavuah.getNumberDefinition(this.state.kavuahType) +
                '" was not set.\n' +
                'If you do not understand how to fill this information, please contact your Rabbi for assistance.',
                'Incorrect information'
            );
            return;
        }
        const kavuah = new Kavuah(
            this.state.kavuahType,
            this.state.settingEntry,
            this.state.specialNumber,
            this.state.cancelsOnahBeinunis,
            this.state.active
        ),
            doAdd = () =>
                DataUtils.KavuahToDatabase(kavuah)
                    .then(() => {
                        popUpMessage(
                            `The Kavuah for ${kavuah.toString()} has been successfully added.`,
                            'Add Kavuah'
                        );
                        if (this.onUpdate) {
                            this.onUpdate(this.appData);
                        }
                        this.dispatch(NavigationActions.back());
                    })
                    .catch(err => {
                        warn(
                            'Error trying to insert kavuah into the database.'
                        );
                        error(err);
                    });
        if (kavuah.specialNumberMatchesEntry) {
            doAdd();
        } else {
            Alert.alert(
                'Possibly Incorrect information',
                'The number for the "' +
                Kavuah.getNumberDefinition(this.state.kavuahType) +
                '" does not seem to match the Setting Entry information.\n' +
                'Please check that the information is correct.\n' +
                'If you do not fully understand how to fill in this information, ' +
                'please contact your Rabbi for assistance.',
                [
                    //Button 1
                    {
                        text: 'Cancel',
                        onPress: () => {
                            return;
                        },
                        style: 'cancel',
                    },
                    //Button 2
                    {
                        text: 'Add anyway',
                        onPress: () => {
                            doAdd();
                        },
                    },
                ]
            );
        }
    }
    getSpecialNumberFromEntry(entry) {
        return (
            Kavuah.getDefaultSpecialNumber(
                entry,
                this.state.kavuahType,
                this.listOfEntries
            ) || this.state.specialNumber
        );
    }
    getSpecialNumberFromKavuahType(kavuahType) {
        return (
            Kavuah.getDefaultSpecialNumber(
                this.state.settingEntry,
                kavuahType,
                this.listOfEntries
            ) || this.state.specialNumber
        );
    }
    render() {
        return (
            <View style={GeneralStyles.container}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <SideMenu
                        onUpdate={this.onUpdate}
                        appData={this.appData}
                        navigator={this.props.navigation}
                        helpUrl="Kavuahs.html"
                        helpTitle="Kavuahs"
                    />
                    <ScrollView style={{ flex: 1 }}>
                        <KavuahPickers
                            settingEntry={this.state.settingEntry}
                            kavuahType={this.state.kavuahType}
                            specialNumber={this.state.specialNumber}
                            listOfEntries={this.listOfEntries}
                            setKavuahType={value =>
                                this.setState({
                                    kavuahType: value,
                                    specialNumber: this.getSpecialNumberFromKavuahType(
                                        value
                                    ),
                                })
                            }
                            setSettingEntry={value =>
                                this.setState({
                                    settingEntry: value,
                                    specialNumber: this.getSpecialNumberFromEntry(
                                        value
                                    ),
                                })
                            }
                            setSpecialNumber={value =>
                                this.setState({ specialNumber: value })
                            }
                        />
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>
                                Cancels Onah Beinonis
                            </Text>
                            <Switch
                                style={GeneralStyles.switch}
                                value={this.state.cancelsOnahBeinunis}
                                onValueChange={value =>
                                    this.setState({
                                        cancelsOnahBeinunis: value,
                                    })
                                }
                            />
                        </View>
                        <View style={GeneralStyles.formRow}>
                            <Text style={GeneralStyles.label}>Active</Text>
                            <Switch
                                style={GeneralStyles.switch}
                                value={this.state.active}
                                onValueChange={value =>
                                    this.setState({ active: value })
                                }
                            />
                        </View>
                        <Text>{'\n'}</Text>
                        <View style={GeneralStyles.btnAddNew}>
                            <Button
                                title="Add Kavuah"
                                onPress={this.addKavuah.bind(this)}
                                accessibilityLabel="Add this new Kavuah"
                                color={GLOBALS.BUTTON_COLOR}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}
