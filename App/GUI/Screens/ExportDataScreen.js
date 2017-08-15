import React from 'react';
import { ScrollView, View, Text, TextInput, Button, Picker } from 'react-native';
import { NavigationActions } from 'react-navigation';
import RNFS from 'react-native-fs';
import SideMenu from '../Components/SideMenu';
import { popUpMessage, log, warn, error, buttonColor } from '../../Code/GeneralUtils';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import { UserOccasionTypes } from '../../Code/JCal/UserOccasion';
import { GeneralStyles } from '../styles';

const exportPath = RNFS.DocumentDirectoryPath + '/exported';

export default class ExportData extends React.Component {
    static navigationOptions = {
        title: 'Export Data'
    };
    constructor(props) {
        super(props);
        this.navigator = this.props.navigation;
        this.appData = this.navigator.state.params.appData;
        this.state = {
            fileName: this.getFileName('Entries'),
            dataSet: 'Entries'
        };
        this.setDataSet = this.setDataSet.bind(this);
        this.doExport = this.doExport.bind(this);
        this.getCsvText = this.getCsvText.bind(this);
    }
    getFileName(dataSet) {
        return `${dataSet}-${(new Date()).toLocaleString().replace(/[\/,: ]/gi, '-')}.csv`;
    }
    setDataSet(dataSet) {
        this.setState({
            fileName: this.getFileName(dataSet),
            dataSet: dataSet
        });
    }
    getCsvText() {
        let csv = '';
        switch (this.state.dataSet) {
            case 'Entries':
                csv = '"Date","Onah","Haflaga","IgnoreForFlaggedDates","IgnoreForKavuahs","Comments"\r\n';
                for (let entry of this.appData.EntryList.list) {
                    csv += `"${entry.date.toString()}","${(entry.nightDay === NightDay.Night ?
                        'Night' : 'Day')}","${entry.haflaga.toString()}","${(entry.ignoreForFlaggedDates ?
                            'Yes' : 'No')}","${(entry.ignoreForKavuah ?
                                'Yes' : 'No')}","${entry.comments}"\r\n`;
                }
                break;
            case 'Events':
                csv = '"Jewish Date","Secular Date","Description","Comments","Color"\r\n';
                for (let occ of this.appData.UserOccasions) {
                    csv += `"${occ.jdate.toShortString(false)}","${occ.sdate.toLocaleDateString()}","${occ.toString(true)}","${occ.comments}","${occ.color}"\r\n`;
                }
                break;
            case 'Kavuahs':
                csv = '"Description","Setting Entry","Cancels Onah Beinunis","Active","Ignored"\r\n';
                for (let kavuah of this.appData.KavuahList) {
                    csv += `"${kavuah.toString()}","${kavuah.settingEntry.toLongString()}","${(kavuah.cancelsOnahBeinunis ?
                        'Yes' : 'No')}","${(kavuah.active ?
                            'Yes' : 'No')}","${(kavuah.ignore ?
                                'Yes' : 'No')}"\r\n`;
                }
                break;
        }
        return csv;
    }
    doExport() {
        RNFS.exists(exportPath).then(exists => {
            if (!exists) {
                RNFS.mkdir(exportPath).then(() => {
                    this.doExport();
                    return;
                });
                return;
            }
        });
        const csv = this.getCsvText();
        log(csv);
        RNFS.writeFile(`${exportPath}/${this.state.fileName}`, csv)
            .then(() => {
                popUpMessage(`The file ${this.state.fileName} has been successfully created.`,
                    'Export ' + this.state.dataSet);
            })
            .catch(err => {
                warn('Error trying to create ' + this.state.fileName);
                error(err);
            });
    }
    render() {
        return <View style={GeneralStyles.container}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <SideMenu
                    onUpdate={this.onUpdate}
                    appData={this.appData}
                    navigator={this.navigator}
                    helpUrl='Settings.html'
                    helpTitle='Settings' />
                <ScrollView style={{ flex: 1 }}>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>Data to Export</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={this.state.dataSet}
                            onValueChange={value => this.setDataSet(value)}>
                            <Picker.Item label='Entries' value='Entries' />
                            <Picker.Item label='Events' value='Events' />
                            <Picker.Item label='Kavuahs' value='Kavuahs' />
                        </Picker>
                    </View>
                    <View style={GeneralStyles.formRow}>
                        <Text style={GeneralStyles.label}>File Name</Text>
                        <TextInput style={GeneralStyles.textInput}
                            autoFocus
                            placeholder='File Name'
                            onEndEditing={event =>
                                this.setState({ fileName: event.nativeEvent.text.replace(/[\/,: ]/gi, '-') })}
                            defaultValue={this.state.fileName} />
                    </View>
                    <View style={GeneralStyles.btnAddNew}>
                        <Button
                            title='Export Data'
                            onPress={this.doExport}
                            accessibilityLabel='Export Data'
                            color={buttonColor} />
                    </View>
                </ScrollView>
            </View>
        </View>;
    }
}