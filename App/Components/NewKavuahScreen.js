import React from 'react';
import { ScrollView, View, Text, Picker, Switch, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import SideMenu from './SideMenu';
import { KavuahTypes, Kavuah } from '../Code/Chashavshavon/Kavuah';
import DataUtils from '../Code/Data/DataUtils';
import { popUpMessage } from '../Code/GeneralUtils';
import { GeneralStyles } from './styles';

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
        this.navigate = this.props.navigation.navigate;
        this.entryList = appData.EntryList;
        if (this.entryList.list.length > 0 && !settingEntry) {
            settingEntry = this.entryList.list[this.entryList.list.length - 1];
        }
        this.state = {
            appData: appData,
            settingEntry: settingEntry,
            kavuahType: KavuahTypes.Haflagah,
            specialNumber: settingEntry && settingEntry.haflaga,
            cancelsOnahBeinunis: true,
            active: true
        };
        this.getSpecialNumber = this.getSpecialNumber.bind(this);
        this.getSpecialNumberFromEntry = this.getSpecialNumberFromEntry.bind(this);
        this.getSpecialNumberFromKavuahType = this.getSpecialNumberFromKavuahType.bind(this);
    }
    componentWillMount() {
        if (!this.state.settingEntry) {
            Alert.alert('Kavuahs can only be added after an Entry has been added!');
            this.dispatch(NavigationActions.back());
        }
    }
    addKavuah() {
        if (!this.state.specialNumber) {
            Alert.alert('Incorrect information',
                'The "Kavuah Defining Number" was not set.\n' +
                'If you do not understand how to fill this information, please contact your Rabbi for assistance.');
            return;
        }
        const ad = this.state.appData,
            kavuah = new Kavuah(this.state.kavuahType,
                this.state.settingEntry,
                this.state.specialNumber,
                this.state.cancelsOnahBeinunis, this.state.active);
        if (!kavuah.specialNumberMatchesEntry) {
            Alert.alert('Incorrect information',
                'The "Kavuah Defining Number" does not match the Setting Entry information for the selected Kavuah Type.\n' +
                'Please check that the chosen information is correct and try again.\n' +
                'If you do not understand how to fill this information, please contact your Rabbi for assistance.');
            return;
        }
        ad.KavuahList.push(kavuah);
        this.setState({ appData: ad });
        DataUtils.KavuahToDatabase(kavuah);
        if (this.onUpdate) {
            this.onUpdate(ad);
        }
        popUpMessage(`The Kavuah for ${kavuah.toString()} has been successfully added.`,
            'Add Kavuah');
        this.dispatch(NavigationActions.back());
    }
    getSpecialNumberFromEntry(entry) {
        return this.getSpecialNumber(entry, this.state.kavuahType);
    }
    getSpecialNumberFromKavuahType(kavuahType) {
        return this.getSpecialNumber(this.state.settingEntry, kavuahType);
    }
    getSpecialNumber(settingEntry, kavuahType) {
        if (settingEntry.haflaga &&
            [KavuahTypes.Haflagah, KavuahTypes.HaflagaMaayanPasuach].includes(kavuahType)) {
            return settingEntry.haflaga;
        }
        else if ([KavuahTypes.DayOfMonth, KavuahTypes.DayOfMonthMaayanPasuach].includes(kavuahType)) {
            return settingEntry.day;
        }

        return this.state.specialNumber;
    }
    render() {
        const nums = Array.from({ length: 100 }, (v, i) => i + 1);

        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.state.appData}
                    navigate={this.navigate}
                    hideOccasions={true} />
                <ScrollView style={{ flex: 1 }}>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Kavuah Type</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={this.state.kavuahType}
                            onValueChange={value => this.setState({
                                kavuahType: value,
                                specialNumber: this.getSpecialNumberFromKavuahType(value)
                            })}>
                            <Picker.Item label='Haflaga' value={KavuahTypes.Haflagah} />
                            <Picker.Item label='Day Of Month' value={KavuahTypes.DayOfMonth} />
                            <Picker.Item label='Day Of Week' value={KavuahTypes.DayOfWeek} />
                            <Picker.Item label='"Dilug" of Haflaga' value={KavuahTypes.DilugHaflaga} />
                            <Picker.Item label='"Dilug" of Day Of Month' value={KavuahTypes.DilugDayOfMonth} />
                            <Picker.Item label='Sirug' value={KavuahTypes.Sirug} />
                            <Picker.Item label={'Haflaga with Ma\'ayan Pasuach'} value={KavuahTypes.HaflagaMaayanPasuach} />
                            <Picker.Item label={'Day Of Month with Ma\'ayan Pasuach'} value={KavuahTypes.DayOfMonthMaayanPasuach} />
                        </Picker>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Setting Entry</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={this.state.settingEntry}
                            onValueChange={value => this.setState({
                                settingEntry: value,
                                specialNumber: this.getSpecialNumberFromEntry(value)
                            })}>
                            {this.entryList.descending.map(entry =>
                                <Picker.Item label={entry.toString()} value={entry} key={entry.entryId} />
                            )}
                        </Picker>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Kavuah Defining Number</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={this.state.specialNumber}
                            onValueChange={value => this.setState({ specialNumber: value })}>
                            {nums.map(num =>
                                (<Picker.Item key={num} label={num.toString()} value={num} />))}
                        </Picker>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Cancels Onah Beinonis</Text>
                        <Switch style={GeneralStyles.switch}
                            value={this.state.cancelsOnahBeinunis}
                            onValueChange={value => this.setState({ cancelsOnahBeinunis: value })} />
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Active</Text>
                        <Switch style={GeneralStyles.switch}
                            value={this.state.active}
                            onValueChange={value => this.setState({ active: value })} />
                    </View>
                    <Text>{'\n'}</Text>
                    <View style={GeneralStyles.formRow}>
                        <Button title='Add Kavuah' onPress={this.addKavuah.bind(this)} />
                    </View>
                </ScrollView>
            </View>
        </View>;
    }
}