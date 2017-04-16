import React from 'react';
import { ScrollView, View, StyleSheet, Text, Picker, Switch, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import {KavuahTypes, Kavuah} from '../Code/Chashavshavon/Kavuah';
import DataUtils from '../Code/Data/DataUtils';

export default class NewKavuah extends React.Component {
    static navigationOptions = {
        title: 'New Kavuah',
    };
    constructor(props) {
        super(props);
        const navigation = this.props.navigation;
        let { appData, onUpdate, settingEntry } = navigation.state.params;
        this.onUpdate = onUpdate;
        this.navigate = navigation.navigate;
        this.entryList = appData.EntryList;
        if (!settingEntry) {
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
    }
    addKavuah() {
        const ad = this.state.appData,
            kavuah = new Kavuah(this.state.kavuahType,
                this.state.settingEntry,
                this.state.specialNumber,
                this.state.cancelsOnahBeinunis, this.state.active);
        ad.KavuahList.push(kavuah);
        this.setState({ appData: ad });
        DataUtils.KavuahToDatabase(kavuah);
        this.onUpdate();
        Alert.alert('Add Kavuah',
                    `The Kavuah for ${kavuah.toString()} has been successfully added.`);
        this.navigate('Kavuahs', { appData: this.state.appData });
    }
    render() {
        const nums = [];
        for (let i = 0; i <= 100; i++) {
            nums.push(i);
        }
        return <ScrollView style={styles.container}>
            <View style={styles.formRow}>
                <Text style={styles.label}>Setting Entry</Text>
                <Picker style={styles.picker}
                    selectedValue={this.state.settingEntry}
                    onValueChange={value => this.setState({ settingEntry: value })}>
                    {this.entryList.descending.map(entry =>
                        <Picker.Item label={entry.toString()} value={entry} key={entry.entryId} />
                    )}
                </Picker>
            </View>
            <View style={styles.formRow}>
                <Text style={styles.label}>Kavuah Type</Text>
                <Picker style={styles.picker}
                    selectedValue={this.state.kavuahType}
                    onValueChange={value => this.setState({ kavuahType: value })}>
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
            <View style={styles.formRow}>
                <Text style={styles.label}>Kavuah Defining Number</Text>
                <Picker style={styles.picker}
                    selectedValue={this.state.specialNumber}
                    onValueChange={value => this.setState({ specialNumber: value })}>
                    {nums.map(num =>
                        (<Picker.Item key={num} label={num.toString()} value={num} />))}
                </Picker>
            </View>
            <View style={styles.formRow}>
                <Text style={styles.label}>Cancels Onah Beinonis</Text>
                <Switch style={styles.switch}
                    value={this.state.cancelsOnahBeinunis}
                    onValueChange={value => this.setState({ cancelsOnahBeinunis: value })} />
            </View>
            <View style={styles.formRow}>
                <Text style={styles.label}>Active</Text>
                <Switch style={styles.switch}
                    value={this.state.active}
                    onValueChange={value => this.setState({ active: value })} />
            </View>
            <Text>{'\n'}</Text>
            <View style={styles.formRow}>
                <Button title='Add Kavuah' onPress={this.addKavuah.bind(this)} />
            </View>
        </ScrollView>;
    }
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    formRow: { flex: 1, flexDirection: 'column' },
    label: { margin: 0, backgroundColor: '#f5f5e8', padding: 10 },
    picker: { margin: 0 },
    switch: { margin: 5, alignSelf: 'flex-start' }
});