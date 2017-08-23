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
                        'Night' : 'Day')}","${entry.haflaga.toString()}","${yon(entry.ignoreForFlaggedDates)
                        }","${yon(entry.ignoreForKavuah)}","${entry.comments}"\r\n`;
                }
                break;
            case 'Events':
                csv = '"Jewish Date","Secular Date","Description","Comments","Color"\r\n';
                for (let occ of this.appData.UserOccasions) {
                    csv += `"${occ.jdate.toShortString(false)}","${occ.sdate.toLocaleDateString()
                        }","${occ.toString(true)}","${occ.comments}","${occ.color}"\r\n`;
                }
                break;
            case 'Kavuahs':
                csv = '"Description","Setting Entry","Cancels Onah Beinunis","Active","Ignored"\r\n';
                for (let kavuah of this.appData.KavuahList) {
                    csv += `"${kavuah.toString()}","${kavuah.settingEntry.toLongString()
                        }","${yon(kavuah.cancelsOnahBeinunis)}","${yon(kavuah.active)}","${yon(kavuah.ignore)}"\r\n`;
                }
                break;
            case 'Settings':
                var settings = this.appData.Settings;
                /*
                                settings.location;
                                settings.showOhrZeruah;
                                settings.onahBeinunis24Hours;
                                settings.keepThirtyOne;
                                settings.keepLongerHaflagah;
                                settings.cheshbonKavuahByCheshbon;
                                settings.haflagaOfOnahs;
                                settings.kavuahDiffOnahs;
                                settings.numberMonthsAheadToWarn;
                                settings.calcKavuahsOnNewEntry;
                                settings.showEntryFlagOnHome;
                                settings.showProbFlagOnHome;
                                settings.navigateBySecularDate;
                                settings.showIgnoredKavuahs;
                                settings.noProbsAfterEntry;
                                settings.hideHelp;
                                settings.requirePIN;
                */
                csv = '"Location","Ohr Zeruah","Onah Beinunis 24 Hours","Day Thirty One", \
                    "Shorter Haflagah - No Cancel","Dilug Yom Hachodesh Kavuahs Another Month", \
                    "Haflaga Of Onahs","Haflaga of Diff Onahs","Months Ahead To Warn","Calc Kavuahs New Entry", \
                    "Show Entries On Main Screen","Show Flags On Main Screen","Calendar Displays Current", \
                    "Show Ignored Kavuahs","No Flags Right After Entry","Hide Help","Require PIN"\r\n'+
                    `"${settings.location.Name}","${yon(settings.showOhrZeruah)}"` +
                    `,"${yon(settings.onahBeinunis24Hours)}","${yon(settings.keepLongerHaflagah)}"` +
                    `,"${yon(settings.cheshbonKavuahByCheshbon)}","${yon(settings.haflagaOfOnahs)}"` +
                    `,"${yon(settings.kavuahDiffOnahs)}","${settings.numberMonthsAheadToWarn.toString()}"` +
                    `,"${yon(settings.calcKavuahsOnNewEntry)}","${yon(settings.showEntryFlagOnHome)}"` +
                    `,"${yon(settings.showProbFlagOnHome)}","${settings.navigateBySecularDate ? 'Secular' : 'Jewish'} Date"` +
                    `,"${yon(settings.showIgnoredKavuahs)}","${yon(settings.noProbsAfterEntry)}"` +
                    `,"${yon(settings.hideHelp)}","${yon(settings.requirePIN)}"\r\n`;
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
                        td(yon(entry.ignoreForFlaggedDates)) +
                        td(yon(entry.ignoreForKavuah)) +
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
                        td(yon(kavuah.cancelsOnahBeinunis)) +
                        td(yon(kavuah.active)) +
                        td(yon(kavuah.ignore)));
                }
                break;
            case 'Settings':
                var settings = this.appData.Settings;
                html += '<tr><td>' +
                    `<p><b>Location</b><br />${settings.location}<hr /></p>` +
                    `<p><b>Flag previous onah (The "Ohr Zaruah")</b><br />${yon(settings.showOhrZeruah)}<hr /></p>` +
                    `<p><b>Keep Onah Beinonis (30, 31 and Yom HaChodesh) for a full 24 Hours</b><br />${yon(settings.onahBeinunis24Hours)}<hr /></p>` +
                    `<p><b>Keep day Thirty One for Onah Beinonis</b><br />${yon(settings.keepThirtyOne)}<hr /></p>` +
                    `<p><b>Haflaga is only cancelled by a longer one</b><br />${yon(settings.keepLongerHaflagah)}<hr /></p>` +
                    `<p><b>Continue incrementing Dilug Yom Hachodesh Kavuahs into another month</b><br />${yon(settings.cheshbonKavuahByCheshbon)}<hr /></p>` +
                    `<p><b>Calculate Haflagas by counting Onahs</b><br />${yon(settings.haflagaOfOnahs)}<hr /></p>` +
                    `<p><b>Flag Kavuahs even if not all the same Onah</b><br />${yon(settings.kavuahDiffOnahs)}<hr /></p>` +
                    `<p><b>Number of Months ahead to warn</b><br />${settings.numberMonthsAheadToWarn.toString()}<hr /></p>` +
                    `<p><b>Automatically Calculate Kavuahs upon addition of an Entry</b><br />${yon(settings.calcKavuahsOnNewEntry)}<hr /></p>` +
                    `<p><b>Show Entry, Hefsek Tahara and Mikva information</b><br />${yon(settings.showEntryFlagOnHome)}<hr /></p>` +
                    `<p><b>Show flags for problem dates on Main Screen</b><br />${yon(settings.showProbFlagOnHome)}<hr /></p>` +
                    `<p><b>Calendar displays current</b><br />${settings.navigateBySecularDate ? 'Secular' : 'Jewish'} Date<hr /></p>` +
                    `<p><b>Show explicitly ignored Kavuahs in the Kavuah list</b><br />${yon(settings.showIgnoredKavuahs)}<hr /></p>` +
                    `<p><b>Don't show Flagged dates for a week after Entry</b><br />${yon(settings.noProbsAfterEntry)}<hr /></p>` +
                    `<p><b>Hide Help Button</b><br />${yon(settings.hideHelp)}<hr /></p>` +
                    `<p><b>Require PIN to open application?</b><br />${yon(settings.requirePIN)}<hr /></p>` +
                    '</td></tr>';
                break;
        }
        html += '</table></div>';
        return html;
    }
    async doExport(silent) {
        let filePath;

        filePath = `${exportPath}/${this.state.fileName}`;
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
                            <Picker.Item label='Settings' value='Settings' />
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
function yon(bool) {
    return bool ? 'Yes' : 'No';
}