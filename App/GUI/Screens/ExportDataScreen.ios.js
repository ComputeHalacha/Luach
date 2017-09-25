import React from 'react';
import { ScrollView, View, Text, Button } from 'react-native';
import RNFS from 'react-native-fs';
import Mailer from 'react-native-mail';
import { Select, Option } from 'react-native-chooser';
import SideMenu from '../Components/SideMenu';
import { popUpMessage, log, warn, error, buttonColor } from '../../Code/GeneralUtils';
import { NightDay } from '../../Code/Chashavshavon/Onah';
import Utils from '../../Code/JCal/Utils';
import { GeneralStyles } from '../styles';

const exportPath = RNFS.DocumentDirectoryPath;

export default class ExportData extends React.Component {
    static navigationOptions = {
        title: 'Export Data'
    };
    constructor(props) {
        super(props);
        this.navigator = this.props.navigation;

        const { appData, dataSet } = this.navigator.state.params;

        this.appData = appData;
        this.state = { dataSet: (dataSet || 'Entries') };
        this.getFileName = this.getFileName.bind(this);
        this.doExport = this.doExport.bind(this);
        this.doEmail = this.doEmail.bind(this);
        this.getCsvText = this.getCsvText.bind(this);
        this.getHtmlText = this.getHtmlText.bind(this);
    }
    getFileName() {
        return `${this.state.dataSet}-${(new Date()).toLocaleString().replace(/[\/,: ]/gi, '-')}.csv`;
    }
    getCsvText() {
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
                    const settings = this.appData.Settings;
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
            case 'Zmanim_Today':

                break;
            case 'Zmanim_30':
                break;
        }
        return csv;
    }
    getHtmlText() {
        const settings = this.appData.Settings;
        let counter = 0,
            html = `<html><head><title>Luach - Export Data</title></head>
                    <body style="font-family:Verdana, Arial, Tahoma;padding:15px;background-color:#f5f5ff;">
                        <img src="http://compute.co.il/luach/app/Images/Feature.png" />
                        <br />
                        <h1 style="color:#7777bb;">
                            ${this.state.dataSet} -
                            ${(new Date()).toLocaleDateString()}
                        </h1>
                        <table width="100%" cellspacing="0" cellpadding="5" border="1" style="border-collapse:collapse;border-color:#7777bb;">`;
        switch (this.state.dataSet) {
            case 'Entries':
                html += '<tr style="background-color:#e1e1ff;"> \
                            <td style="background-color:#7777bb;">&nbsp;</td> \
                            <td>Date</td> \
                            <td>Onah</td> \
                            <td>Haflaga</td> \
                            <td>IgnoreForFlaggedDates</td> \
                            <td>IgnoreForKavuahs</td> \
                            <td>Comments</td> \
                        </tr>';
                for (let entry of this.appData.EntryList.list) {
                    counter++;
                    html += `<tr>
                                 <td><b>${counter.toString()}</b></td>
                                 <td>${entry.date.toString()}<br />${Utils.toStringDate(entry.date.getDate(), true, true)}</td>
                                 <td>${(entry.nightDay === NightDay.Night ? 'Night' : 'Day')}</td>
                                 <td>${entry.haflaga.toString()}</td>
                                 <td>${yon(entry.ignoreForFlaggedDates)}</td>
                                 <td>${yon(entry.ignoreForKavuah)}</td>
                                 <td>${entry.comments}</td> \
                            </tr>`;
                }
                break;
            case 'Events':
                html += '<tr style="background-color:#e1e1ff;"> \
                            <td style="background-color:#7777bb;">&nbsp;</td> \
                            <td>Title</td> \
                            <td>Jewish Date</td> \
                            <td>Secular Date</td> \
                            <td>Description</td> \
                            <td>Comments</td>\
                        </tr>';
                for (let occ of this.appData.UserOccasions) {
                    counter++;
                    html += `<tr>
                                <td><b>${counter.toString()}</b></td>
                                <td style="background-color:${occ.color};color:#fff;">${occ.title}</td>
                                <td>${occ.jdate.toShortString(false)}</td>
                                <td>${occ.sdate.toLocaleDateString()}</td>
                                <td>${occ.toString(true)}</td>
                                <td>${occ.comments}</td>
                            </tr>`;
                }
                break;
            case 'Kavuahs':
                html += '<tr style="background-color:#e1e1ff;"> \
                            <td style="background-color:#7777bb;">&nbsp;</td> \
                            <td>Description</td> \
                            <td>Setting Entry</td> \
                            <td>Cancels Onah Beinunis</td> \
                            <td>Active</td> \
                            <td>Ignored</td> \
                        </tr>';
                for (let kavuah of this.appData.KavuahList) {
                    counter++;
                    html += `<tr>
                                <td><b>${counter.toString()}</b></td>
                                <td>${kavuah.toString()}</td>
                                <td>${kavuah.settingEntry.toLongString()}</td>
                                <td>${yon(kavuah.cancelsOnahBeinunis)}</td>
                                <td>${yon(kavuah.active)}</td>
                                <td>${yon(kavuah.ignore)}</td>
                            </tr>`;
                }
                break;
            case 'Settings':
                {
                    html += '<tr><td>' +
                        `<p><b>Location</b><br />${settings.location.Name}<hr /></p>` +
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
                        '</td></tr>';
                    break;
                }
            case 'Flagged Dates':
                html += '<tr style="background-color:#e1e1ff;"> \
                        <td style="background-color:#7777bb;">&nbsp;</td> \
                        <td>Date</td> \
                        <td>Onah</td> \
                        <td>Description</td> \
                    </tr>';
                for (let probOnah of this.appData.ProblemOnahs) {
                    counter++;
                    html += `<tr>
                                <td><b>${counter.toString()}</b></td>
                                <td>${probOnah.jdate.toString()}<br />${Utils.toStringDate(probOnah.jdate.getDate(), true, true)}</td>
                                <td>${probOnah.nightDay === NightDay.Night ? 'Night' : 'Day'}</td>
                                <td><ul>${probOnah.flagsList.map(f => '<li>' + f + '</li>').join('')}</ul></td>
                            </tr>`;
                }
                break;
            case 'Zmanim_Today':
                {
                    const today = Utils.nowAtLocation(settings.location),
                        details = today.getAllDetails(settings.location);
                    html += '<tr style="background-color:#e1e1ff;"><td colspan="2">' +
                        '<b>Zmanim for ' + settings.location.Name +
                        '</b></td></tr>';
                    details.map(d => `<tr><td>${d.title}</td><td>${d.value}</td></tr>`).join('');
                    break;
                }
            case 'Zmanim_30':
                {
                    const today = Utils.nowAtLocation(settings.location),
                        details = today.getAllDetails(settings.location);
                    break;
                }
        }
        html += '</table></body></html>';
        return html;
    }
    async doExport() {
        const filePath = `${exportPath}/${this.getFileName()}`,
            csv = this.getCsvText();
        log(csv);
        await RNFS.writeFile(filePath, csv)
            .catch(err => {
                warn('Error trying to create ' + this.state.fileName);
                error(err);
            });
        return filePath;
    }
    async doEmail() {
        const filePath = await this.doExport(),
            subject = 'Luach - Export ' + this.state.dataSet + ' - ' + (new Date()).toLocaleDateString(),
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
                        <Select
                            onSelect={value => this.setState({ dataSet: value })}
                            defaultText={this.state.dataSet}
                            style={GeneralStyles.select}
                            indicator='down'
                            transparent={true}
                            backdropStyle={GeneralStyles.optionListBackdrop}
                            optionListStyle={GeneralStyles.optionListStyle}>
                            <Option value='Entries'>
                                Entries
                            </Option>
                            <Option value='Events'>
                                Events
                            </Option>
                            <Option value='Kavuahs'>
                                Kavuahs
                            </Option>
                            <Option value='Settings'>
                                Settings
                            </Option>
                            <Option value='Flagged Dates'>
                                Flagged Dates
                            </Option>
                            <Option value='Zmanim_Today'>
                                Zmanim - Today
                            </Option>
                            <Option value='Zmanim_30'>
                                Zmanim - 30 days
                            </Option>
                        </Select>
                    </View>
                    <View style={{
                        padding: 10,
                        backgroundColor: '#f1f1ff',
                        borderRadius: 6,
                        margin: 10,
                        fontSize: 9,
                        borderWidth: 1,
                        borderColor: '#88b'
                    }}>
                        <Text>
                            When you press on "Export to Email" below, the email app will open
                            in "compose" mode, with an email containing all of your {this.state.dataSet}.
                            {'\n\n'}
                            In addition, a spreadsheet with all of your {this.state.dataSet} data will be attached to the email.
                            {'\n\n'}
                            It is advisable to send this email to yourself and to keep it as a  backup of your data.
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