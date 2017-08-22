import React from 'react';
import { ScrollView, View, Text, TextInput, Button, Picker, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Mailer from 'react-native-mail';
import SideMenu from '../Components/SideMenu';
import { popUpMessage, log, warn, error, buttonColor } from '../../Code/GeneralUtils';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import { GeneralStyles } from '../styles';

const isAndroid = Platform.OS === 'android',
    exportPath = isAndroid ?
        RNFS.ExternalDirectoryPath : RNFS.DocumentDirectoryPath;

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
        this.doEmail = this.doEmail.bind(this);
        this.getCsvText = this.getCsvText.bind(this);
        this.getHtmlText = this.getHtmlText.bind(this);
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
    getHtmlText() {
        let counter = 0,
            html = `<div style="font-family:Verdana, Arial, Tahoma;padding:15px;background-color:#f5f5ff;">
                            <h1 style="color:#7777bb;">
                                <font color="#7777bb">
                                    Data Export from Luach -
                                    ${this.state.dataSet} -
                                    ${(new Date()).toLocaleDateString()}
                                </font>
                            </h1>
                            <table width="100%" cellspacing="0" cellpadding="5" border="1" style="border-collapse:collapse;border-color:#7777bb;style="min-width:550px;">`;
        switch (this.state.dataSet) {
            case 'Entries':
                html += tr('style="background-color:#e1e1ff;">',
                    td('&nbsp;', 'style="background-color:#7777bb;"') +
                    td('Date') +
                    td('Onah') +
                    td('Haflaga') +
                    td('IgnoreForFlaggedDates') +
                    td('IgnoreForKavuahs') +
                    td('Comments'));
                for (let entry of this.appData.EntryList.list) {
                    counter++;
                    html += tr('',
                        td(`<b>${counter.toString()}</b>`) +
                        td(entry.date.toString()) +
                        td(entry.nightDay === NightDay.Night ? 'Night' : 'Day') +
                        td(entry.haflaga.toString()) +
                        td(entry.ignoreForFlaggedDates ? 'Yes' : 'No') +
                        td(entry.ignoreForKavuah ? 'Yes' : 'No') +
                        td(entry.comments));
                }
                break;
            case 'Events':
                html += tr('style="background-color:#e1e1ff;"',
                    td('&nbsp;', 'style="background-color:#7777bb;"') +
                    td('Title') +
                    td('Jewish Date') +
                    td('Secular Date') +
                    td('Description') +
                    td('Comments'));
                for (let occ of this.appData.UserOccasions) {
                    counter++;
                    html += tr('',
                        td(`<b>${counter.toString()}</b>`) +
                        td(occ.title, `background-color:${occ.color};color:#fff;`) +
                        td(occ.jdate.toShortString(false)) +
                        td(occ.sdate.toLocaleDateString()) +
                        td(occ.toString(true)) +
                        td(occ.comments));
                }
                break;
            case 'Kavuahs':
                html += tr('style="background-color:#e1e1ff;"',
                    td('&nbsp;', 'style="background-color:#7777bb;"') +
                    td('Description') +
                    td('Setting Entry') +
                    td('Cancels Onah Beinunis') +
                    td('Active') +
                    td('Ignored'));
                for (let kavuah of this.appData.KavuahList) {
                    counter++;
                    html += tr('',
                        td(`<b>${counter.toString()}</b>`) +
                        td(kavuah.toString()) +
                        td(kavuah.settingEntry.toLongString()) +
                        td(kavuah.cancelsOnahBeinunis ? 'Yes' : 'No') +
                        td(kavuah.active ? 'Yes' : 'No') +
                        td(kavuah.ignore ? 'Yes' : 'No'));
                }
                break;
        }
        html += '</table></div>';
        return html;
    }
    async doExport(silent) {
        let filePath;

        filePath = `${exportPath} /${this.state.fileName}`;
        const csv = this.getCsvText();
        log(csv);
        await RNFS.writeFile(filePath, csv)
            .then(() => {
                if (!silent) {
                    popUpMessage(`The file ${this.state.fileName} has been successfully created.`,
                        'Export ' + this.state.dataSet);
                }
            })
            .catch(err => {
                warn('Error trying to create ' + this.state.fileName);
                error(err);
            });

        return filePath;
    }
    async doEmail() {
        await this.doExport(true).then(filePath => {
            if (filePath) {
                const subject = 'Luach Export Data - ' + this.state.dataSet + ' - ' + (new Date()).toLocaleDateString(),
                    html = this.getHtmlText();
                log(html);
                Mailer.mail({
                    subject: subject,
                    recipients: [],
                    ccRecipients: [],
                    bccRecipients: [],
                    body: html,
                    isHTML: true,
                    attachment: {
                        path: filePath,
                        type: 'csv',
                        name: this.state.fileName
                    }
                }, error => {
                    if (error) {
                        popUpMessage('We are very sorry, but the email could not be sent.');
                    }
                });
            }
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
                            accessibilityLabel='Create CSV File'
                            color={buttonColor} />
                    </View>
                    <View style={GeneralStyles.btnAddNew}>
                        <Button
                            title='Attach to Email'
                            onPress={this.doEmail}
                            accessibilityLabel='Attach to Email'
                            color={buttonColor} />
                    </View>
                </ScrollView>
            </View>
        </View>;
    }
}

function tr(attributes, inner) {
    if (isAndroid) {
        return `<div${attributes ? ' ' + attributes : ''}>${inner}</div>`;
    }
    else {
        return `<tr${attributes ? ' ' + attributes : ''}>${inner}</tr>`;
    }
}

function td(inner, attributes) {
    if (isAndroid) {
        return `${inner || '&nbsp;'}&nbsp;|&nbsp;`;
    }
    else {
        return `<td${attributes ? ' ' + attributes : ''}>${inner || '&nbsp;'}</td>`;
    }
}