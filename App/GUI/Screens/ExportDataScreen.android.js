import React from 'react';
import { ScrollView, View, Text, Button, Picker } from 'react-native';
import RNFS from 'react-native-fs';
import Mailer from 'react-native-mail';
import SideMenu from '../Components/SideMenu';
import { popUpMessage, log, warn, error, buttonColor } from '../../Code/GeneralUtils';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import jDate from '../../Code/JCal/jDate';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

const exportPath = RNFS.ExternalDirectoryPath;

export default class ExportData extends React.Component {
    static navigationOptions = {
        title: 'Export Data'
    };
    constructor(props) {
        super(props);
        this.navigator = this.props.navigation;

        const { appData, dataSet, jdate, sdate } = this.navigator.state.params;

        this.appData = appData;
        this.jdate = jdate || Utils.nowAtLocation(this.appData.Settings.location);
        this.sdate = sdate || this.jdate.getDate();
        this.sdateString = Utils.sMonthsEng[this.sdate.getMonth()] + ' ' +
            this.sdate.getFullYear().toString();
        this.state = { dataSet: (dataSet || 'Entries') };
        this.getFileName = this.getFileName.bind(this);
        this.doExport = this.doExport.bind(this);
        this.doEmail = this.doEmail.bind(this);
        this.getCsvText = this.getCsvText.bind(this);
        this.getHtmlText = this.getHtmlText.bind(this);
    }
    getFileName() {
        const dateString = this.sdate.toLocaleString().replace(/[\/,: ]/gi, '-');
        return `${this.state.dataSet}-${dateString}.csv`;
    }
    getCsvText() {
        const settings = this.appData.Settings;
        let csv = '';
        switch (this.state.dataSet) {
            case 'Entries':
                csv = '"Jewish Date","Secular Date",Onah","Haflaga","Ignore For Flagged Dates","Ignore For Kavuahs","Comments"\r\n';
                for (let entry of this.appData.EntryList.list) {
                    csv += `"${entry.date.toString()}","${yon(entry.date.getDate().toLocaleDateString())
                        }","${(entry.nightDay === NightDay.Night ?
                            'Night' : 'Day')}","${entry.haflaga ? entry.haflaga.toString() : ' - '
                        }","${yon(entry.ignoreForFlaggedDates)
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
                {
                    csv = '"Location","Ohr Zeruah","Onah Beinunis 24 Hours","Day Thirty One",' +
                        '"Shorter Haflagah - No Cancel","Dilug Yom Hachodesh Kavuahs Another Month",' +
                        '"Haflaga Of Onahs","Haflaga of Diff Onahs","Months Ahead To Warn","Calc Kavuahs New Entry",' +
                        '"Show Entries On Main Screen","Show Flags On Main Screen","Calendar Displays Current",' +
                        '"Show Ignored Kavuahs","No Flags Right After Entry","Hide Help","Require PIN"\r\n' +
                        `"${settings.location.Name}","${yon(settings.showOhrZeruah)}"` +
                        `,"${yon(settings.onahBeinunis24Hours)}","${yon(settings.keepThirtyOne)}","${yon(settings.keepLongerHaflagah)}"` +
                        `,"${yon(settings.dilugChodeshPastEnds)}","${yon(settings.haflagaOfOnahs)}"` +
                        `,"${yon(settings.kavuahDiffOnahs)}","${settings.numberMonthsAheadToWarn.toString()}"` +
                        `,"${yon(settings.calcKavuahsOnNewEntry)}","${yon(settings.showEntryFlagOnHome)}"` +
                        `,"${yon(settings.showProbFlagOnHome)}","${settings.navigateBySecularDate ? 'Secular' : 'Jewish'} Date"` +
                        `,"${yon(settings.showIgnoredKavuahs)}","${yon(settings.noProbsAfterEntry)}"` +
                        `,"${yon(settings.hideHelp)}","${yon(settings.requirePIN)}"\r\n`;
                    break;
                }
            case 'Flagged Dates':
                csv = '"Jewish Date","Secular Date","Onah","Description"\r\n';
                for (let probOnah of this.appData.ProblemOnahs) {
                    csv += `"${probOnah.jdate.toString()}","${probOnah.jdate.getDate().toLocaleDateString()
                        }","${probOnah.nightDay === NightDay.Night ? 'Night' : 'Day'
                        }","The ${probOnah.flagsList.join(' and the ')}"\r\n`;
                }
                break;
            case 'Zmanim - ' + this.jdate.toShortString():
                {
                    const details = this.jdate.getAllDetails(settings.location);
                    csv += `"Location",${details.map(d => '"' + d.title + '"').join(',')}` + '\r\n' +
                        `"${settings.location.Name}",${details.map(d => '"' + d.value + '"').join(',')}`;
                    break;
                }
            case 'Zmanim - ' + this.jdate.monthName():
                {
                    const month = this.jdate.Month;
                    let currDate = new jDate(this.jdate.Year, month, 1),
                        details = currDate.getAllDetailsList(settings.location);
                    csv += `"Location: ${settings.location.Name}"\r\n${details.map(d => '"' + d.title + '"').join(',')}\r\n`;
                    while (currDate.Month === month) {
                        csv += details.map(d => '"' + d.value + '"').join(',') + '\r\n';
                        currDate = currDate.addDays(1);
                        details = currDate.getAllDetailsList(settings.location);
                    }
                    break;
                }
            case 'Zmanim - ' + this.sdateString:
                {
                    const month = this.sdate.getMonth();
                    let currDate = new jDate(new Date(this.sdate.getFullYear(), month, 1)),
                        details = currDate.getAllDetailsList(settings.location);
                    csv += `"Location: ${settings.location.Name}"\r\n${details.map(d => '"' + d.title + '"').join(',')}\r\n`;
                    while (currDate.getDate().getMonth() === month) {
                        csv += details.map(d => '"' + d.value + '"').join(',') + '\r\n';
                        currDate = currDate.addDays(1);
                        details = currDate.getAllDetailsList(settings.location);
                    }
                    break;
                }
        }
        return csv;
    }
    getHtmlText() {
        const settings = this.appData.Settings;
        let counter = 0,
            html = `<div style="font-family:Verdana, Arial, Tahoma;padding:15px;background-color:#f5f5ff;">
                            <h1 style="color:#7777bb;">
                                <font color="#7777bb">
                                    Data Export from Luach -
                                    ${this.state.dataSet} -
                                    ${this.sdate.toLocaleDateString()}
                                </font>
                            </h1>
                            <hr />`;
        switch (this.state.dataSet) {
            case 'Entries':
                for (let entry of this.appData.EntryList.list) {
                    counter++;
                    html += `<p>${counter.toString()}. ${entry.toLongString().replace(/\n/g, '<br />')}</p><hr />`;
                }
                break;
            case 'Events':
                for (let occ of this.appData.UserOccasions) {
                    counter++;
                    html += `<p>${counter.toString()}.
                        <font color="${occ.color}"><b>${occ.title.replace(/\n/g, '<br />')}</b></font>
                        <br />
                        ${occ.toString().replace(/\n/g, '<br />')}
                        ${occ.comments ? '<br /><b>Comments:</b> ' + occ.comments : ''}
                        </p><hr />`;
                }
                break;
            case 'Kavuahs':
                for (let kavuah of this.appData.KavuahList) {
                    counter++;
                    html += `<p>${counter.toString()}. ${kavuah.toLongString().replace(/\n/g, '<br />')}</p><hr />`;
                }
                break;
            case 'Settings':
                html += `<p><b>Location</b><br />${settings.location.Name}<hr /></p>` +
                    `<p><b>Flag previous onah (The "Ohr Zaruah")</b><br />${yon(settings.showOhrZeruah)}<hr /></p>` +
                    `<p><b>Keep Onah Beinonis (30, 31 and Yom HaChodesh) for a full 24 Hours</b><br />${yon(settings.onahBeinunis24Hours)}<hr /></p>` +
                    `<p><b>Keep day Thirty One for Onah Beinonis</b><br />${yon(settings.keepThirtyOne)}<hr /></p>` +
                    `<p><b>Haflaga is only cancelled by a longer one</b><br />${yon(settings.keepLongerHaflagah)}<hr /></p>` +
                    `<p><b>Continue incrementing Dilug Yom Hachodesh Kavuahs into another month</b><br />${yon(settings.dilugChodeshPastEnds)}<hr /></p>` +
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
                    '<hr />';
                break;
            case 'Flagged Dates':
                for (let probOnah of this.appData.ProblemOnahs) {
                    counter++;
                    html += `<p>${counter.toString()}. ${probOnah.toString().replace(/\n/g, '<br />&nbsp;&nbsp;')}</p><hr />`;
                }
                break;
            case 'Zmanim - ' + this.jdate.toShortString():
                {
                    const details = this.jdate.getAllDetails(settings.location);
                    html += `<p><b>Location</b><br />${settings.location.Name}<hr /></p>` +
                        details.map(d => `<p><b>${d.title}</b><br />${d.value}</hr></p>`).join('') +
                        '<hr />';
                    break;
                }
            case 'Zmanim - ' + this.jdate.monthName():
                {
                    html += '<p>Please find attached a spreadsheet file with the Zmanim \
                    for the month of <b>' + this.jdate.monthName() +
                        '</b> for <b>' +
                        settings.location.Name +
                        '</b></p>';
                    break;
                }
            case 'Zmanim - ' + this.sdateString:
                {
                    html += '<p>Please find attached a spreadsheet file with the Zmanim \
                    for the month of <b>' + this.sdateString +
                        '</b> for <b>' +
                        settings.location.Name +
                        '</b></p>';
                    break;
                }
        }
        html += '</div>';
        return html;
    }
    async doExport() {
        const filePath = `${exportPath}/${this.getFileName()}`,
            csv = this.getCsvText();
        log(csv);
        await RNFS.writeFile(filePath, csv)
            .catch(err => {
                warn('Error trying to create ' + filePath);
                error(err);
            });

        return filePath;
    }
    async doEmail() {
        const filePath = await this.doExport(),
            subject = 'Luach Export Data - ' +
                this.state.dataSet +
                ' - ' +
                this.sdate.toLocaleDateString(),
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
                name: this.getFileName()
            }
        }, error => {
            if (error) {
                popUpMessage('We are very sorry, but the email could not be sent.');
            }
        });
    }
    render() {
        const dateStr = 'Zmanim - ' + this.jdate.toShortString(),
            jMonthStr = 'Zmanim - ' + this.jdate.monthName(),
            sMonthStr = 'Zmanim - ' + this.sdateString;

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
                        <Text style={GeneralStyles.label}>Choose which Data to Export</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={this.state.dataSet}
                            onValueChange={value => this.setState({ dataSet: value })}>
                            <Picker.Item label='Entries' value='Entries' />
                            <Picker.Item label='Events' value='Events' />
                            <Picker.Item label='Kavuahs' value='Kavuahs' />
                            <Picker.Item label='Settings' value='Settings' />
                            <Picker.Item label='Flagged Dates' value='Flagged Dates' />
                            <Picker.Item label={dateStr} value={dateStr} />
                            <Picker.Item label={jMonthStr} value={jMonthStr} />
                            <Picker.Item label={sMonthStr} value={sMonthStr} />
                        </Picker>
                    </View>
                    <View style={{
                        padding: 10,
                        backgroundColor: '#f1f1ff',
                        borderRadius: 6,
                        margin: 10,
                        borderWidth: 1,
                        borderColor: '#88b'
                    }}>
                        <Text>
                            When you press the "Export to Email" button below, your default email client will open up
                            in "compose" mode, with an email containing all of your {this.state.dataSet}.
                            {'\n\n'}
                            A spreadsheet with all of your {this.state.dataSet} data will also be attached to the email.
                            {'\n\n'}
                            It is advisable to send the email to yourself and to keep it as a backup of your data.
                            {'\n\n'}
                            NOTE: It is not (yet) possible to IMPORT data into Luach.
                            {'\n'}
                            If you need to restore your data, it will need to be done manually.
                        </Text>
                    </View>
                    <View style={GeneralStyles.btnAddNew}>
                        <Button
                            title='Export to Email'
                            onPress={this.doEmail}
                            accessibilityLabel='Export to Email'
                            color={buttonColor} />
                    </View>
                </ScrollView>
            </View>
        </View>;
    }
}

function yon(bool) {
    return bool ? 'Yes' : 'No';
}