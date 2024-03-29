import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Button,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Icon } from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import SideMenu from '../Components/SideMenu';
import JdateChooser from '../Components/JdateChooser';
import OnahSynopsis from '../Components/OnahSynopsis';
import TimeInput from '../Components/TimeInput';
import Entry from '../../Code/Chashavshavon/Entry';
import { Kavuah } from '../../Code/Chashavshavon/Kavuah';
import Utils from '../../Code/JCal/Utils';
import jDate from '../../Code/JCal/jDate';
import { NightDay, Onah } from '../../Code/Chashavshavon/Onah';
import DataUtils from '../../Code/Data/DataUtils';
import {
  warn,
  error,
  popUpMessage,
  GLOBALS,
  inform
} from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';
import { addHefsekTaharaAlarm } from '../../Code/Notifications';
import NumberPicker from '../Components/NumberPicker';
import LocalStorage from '../../Code/Data/LocalStorage';
import RemoteBackup from '../../Code/RemoteBackup';

export default class NewEntry extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { entry, appData, onUpdate } = navigation.state.params;
    return {
      title: entry ? 'Edit Entry' : 'New Entry',
      headerRight: entry && (
        <TouchableOpacity
          onPress={() =>
            NewEntry.deleteEntry(entry, appData, ad => {
              if (onUpdate) {
                onUpdate(ad);
              }
              navigation.dispatch(NavigationActions.back());
            })
          }
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 5
            }}
          >
            <Icon name="delete-forever" color="#a33" size={20} />
            <Text
              style={{
                fontSize: 9,
                color: '#a33'
              }}
            >
              Remove
            </Text>
          </View>
        </TouchableOpacity>
      )
    };
  };

  constructor(props) {
    super(props);
    const navigation = this.props.navigation;

    this.navigate = navigation.navigate;
    this.dispatch = navigation.dispatch;

    const { entry, appData, onUpdate } = navigation.state.params;

    this.onUpdate = onUpdate;
    this.appData = appData;
    this.location = appData.Settings.location;

    let jdate, isNight;
    if (entry) {
      this.entry = entry;
      jdate = entry.date;
      isNight = entry.nightDay === NightDay.Night;
    } else {
      jdate = navigation.state.params.jdate;
      isNight = Utils.isAfterSunset(new Date(), this.location);
    }

    const { sunrise, sunset } = jdate.getSunriseSunset(this.location);

    this.sunriseText = sunrise
      ? Utils.getTimeString(sunrise, GLOBALS.IS_24_HOUR)
      : 'Never';
    this.sunsetText = sunset
      ? Utils.getTimeString(sunset, GLOBALS.IS_24_HOUR)
      : 'Never';

    this.state = {
      jdate: jdate,
      nightDay: isNight ? NightDay.Night : NightDay.Day,
      ignoreForFlaggedDates: entry && entry.ignoreForFlaggedDates,
      ignoreForKavuah: entry && entry.ignoreForKavuah,
      comments: (entry && entry.comments) || '',
      addReminder: !entry,
      reminderDay: 5,
      reminderTime: Utils.addMinutes(sunset, -60),
      showAdvancedOptions:
        entry && (entry.ignoreForFlaggedDates || entry.ignoreForKavuah)
    };

    this.addEntry = this.addEntry.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.changeSDate = this.changeSDate.bind(this);
  }
  async addEntry() {
    const appData = this.appData,
      entryList = appData.EntryList,
      onah = new Onah(this.state.jdate, this.state.nightDay),
      entry = new Entry(
        onah,
        undefined,
        this.state.ignoreForFlaggedDates,
        this.state.ignoreForKavuah,
        this.state.comments
      );
    if (entryList.list.find(e => e.isSameEntry(entry))) {
      popUpMessage(
        `The entry for ${entry.toString()} is already in the list.`,
        'Entry already exists'
      );
      return;
    }
    DataUtils.EntryToDatabase(entry)
      .then(async () => {
        appData.EntryList = entryList;
        popUpMessage(
          `The entry for ${entry.toString()} has been successfully added.`,
          'Add Entry'
        );
        if (this.state.addReminder) {
          const { jdate, reminderDay, reminderTime } = this.state,
            //Keep in mind that the day of the hefsek and the current day are both included
            reminderJdate = jdate.addDays(reminderDay - 1),
            { sunset } = reminderJdate.getSunriseSunset(this.location);

          addHefsekTaharaAlarm(
            reminderJdate,
            reminderTime,
            sunset,
            appData.Settings.discreet
          );
        }
        this.checkKavuahPatterns(entry);
        if (this.onUpdate) {
          this.onUpdate(appData);
        }
        if (appData.Settings.autoBackup) {
          const localStorage = await LocalStorage.loadAll();
          if (!localStorage.remoteUserName || !localStorage.remotePassword) {
            inform(
              'Luach is set to automatically backup your data whenever a new Entry is added,\nbut before that can be done, a "remote user name" and "remote password" must be entered on the Settings page.'
            );
          } else {
            const { message } = await RemoteBackup.DoBackupNoMatterWhat(
              localStorage
            );
            if (message) {
              popUpMessage(message);
            }
          }
        }
        if (appData.Settings.calcKavuahsOnNewEntry) {
          const possList = Kavuah.getPossibleNewKavuahs(
            appData.EntryList.realEntrysList,
            appData.KavuahList,
            appData.Settings
          );
          if (possList.length) {
            this.navigate('FindKavuahs', {
              appData: appData,
              onUpdate: this.onUpdate,
              possibleKavuahList: possList
            });
          } else {
            this.dispatch(NavigationActions.back());
          }
        } else {
          this.dispatch(NavigationActions.back());
        }
      })
      .catch(err => {
        warn('Error trying to add entry to the database.');
        error(err);
      });
  }
  updateEntry() {
    const appData = this.appData,
      entryList = appData.EntryList,
      onah = new Onah(this.state.jdate, this.state.nightDay),
      entry = this.entry,
      origEntry = entry.clone();
    entry.onah = onah;
    entry.ignoreForFlaggedDates = this.state.ignoreForFlaggedDates;
    entry.ignoreForKavuah = this.state.ignoreForKavuah;
    entry.comments = this.state.comments;

    if (entryList.list.find(e => e !== entry && e.isSameEntry(entry))) {
      popUpMessage(
        `The entry for ${entry.toString()} is already in the list.`,
        'Entry already exists'
      );
      return;
    }
    DataUtils.EntryToDatabase(entry)
      .then(() => {
        if (this.onUpdate) {
          this.onUpdate(appData);
        }
        popUpMessage(
          `The entry for ${entry.toString()} has been successfully saved.`,
          'Change Entry'
        );
        if (this.state.addReminder) {
          const { jdate, reminderDay, reminderTime } = this.state,
            reminderJdate = jdate.addDays(reminderDay),
            { sunset } = reminderJdate.getSunriseSunset(this.location);

          addHefsekTaharaAlarm(
            reminderJdate,
            reminderTime,
            sunset,
            appData.Settings.discreet
          );
        }
        this.checkKavuahPatterns(entry);
        if (appData.Settings.calcKavuahsOnNewEntry) {
          const possList = Kavuah.getPossibleNewKavuahs(
            appData.EntryList.realEntrysList,
            appData.KavuahList,
            appData.Settings
          );
          if (possList.length) {
            this.navigate('FindKavuahs', {
              appData: appData,
              onUpdate: this.onUpdate,
              possibleKavuahList: possList
            });
          } else {
            this.dispatch(NavigationActions.back());
          }
        } else {
          this.dispatch(NavigationActions.back());
        }
      })
      .catch(err => {
        popUpMessage(
          'We are sorry, Luach is unable to save the changes to this Entry.\nPlease contact luach@compute.co.il.'
        );
        warn('Error trying to add save the changes to the database.');
        error(err);
        //Revert changes
        entry.onah = origEntry.onah;
        entry.ignoreForFlaggedDates = origEntry.ignoreForFlaggedDates;
        entry.ignoreForKavuah = origEntry.ignoreForKavuah;
        entry.comments = origEntry.comments;
      });
  }
  /**
   * Delete an Entry from the database and from the given AppData, then run the onUpdate function with the altered AppData.
   * @param {Entry} entry
   * @param {AppData} appData
   * @param {Function} onUpdate
   */
  static deleteEntry(entry, appData, onUpdate) {
    let kavuahList = appData.KavuahList;

    const kavuahs = kavuahList.filter(k => k.settingEntry.isSameEntry(entry));
    Alert.alert(
      'Confirm Entry Removal',
      kavuahs.length > 0
        ? `The following Kavuah/s were set by this Entry and will need to be removed if you remove this Entry:
                        ${kavuahs.map(k => '\n\t* ' + k.toString())}
                        Are you sure that you want to remove this/these Kavuah/s together with this entry?`
        : 'Are you sure that you want to completely remove this Entry?',
      [
        //Button 1
        {
          text: 'Cancel',
          onPress: () => {
            return;
          },
          style: 'cancel'
        },
        //Button 2
        {
          text: 'OK',
          onPress: () => {
            for (let k of kavuahs) {
              DataUtils.DeleteKavuah(k).catch(err => {
                warn('Error trying to delete a Kavuah from the database.');
                error(err);
              });
            }
            DataUtils.DeleteEntry(entry)
              .then(() => {
                popUpMessage(
                  `The entry for ${entry.toString()} has been successfully removed.`,
                  'Remove entry'
                );
                if (onUpdate) {
                  onUpdate(appData);
                }
              })
              .catch(err => {
                warn('Error trying to delete an entry from the database.');
                error(err);
              });
          }
        }
      ]
    );
  }
  /**
   * Checks the Kavuah list for pattern changes.
   * If this Entry "breaks" an active Kavuah, or "wakes up" an inactive Kavuah, or is out of pattern for a cancelling Kavuah,
   * we will suggest to edit the Kavuah accordingly.
   * @param {Entry} entry
   */
  async checkKavuahPatterns(entry) {
    //We only need to deal with "real" periods.
    if (entry.ignoreForFlaggedDates || entry.ignoreForKavuah) {
      return;
    }
    const appData = this.appData,
      kavuahList = appData.KavuahList,
      entries = appData.EntryList.realEntrysList,
      //find any active Kavuahs that had their pattern "broken".
      brokenKavuahs = Kavuah.findBrokenKavuahs(
        entry,
        kavuahList,
        entries,
        appData.Settings
      ),
      //find any inactive Kavuahs which this Entry is "in pattern" with.
      reawakenedKavuahs = Kavuah.findReawakenedKavuahs(
        entry,
        kavuahList,
        entries,
        appData.Settings
      ),
      //find any Kavuahs that cancel onah beinonis which this entry is out of pattern with.
      outOfPatternKavuahs = Kavuah.findOutOfPattern(
        entry,
        kavuahList,
        entries,
        appData.Settings
      );

    for (let brokenKavuah of brokenKavuahs) {
      Alert.alert(
        'Kavuah Pattern Broken',
        `This Entry is the third Entry in a row that is not in the Kavuah pattern of "${brokenKavuah.toString()}".` +
        '\nDo you wish to set this Kavuah to inactive?',
        [
          //Button 1
          {
            text: 'No',
            onPress: () => {
              return;
            }
          },
          //Button 2
          {
            text: 'Yes',
            onPress: () => {
              brokenKavuah.active = false;
              DataUtils.KavuahToDatabase(brokenKavuah)
                .then(() => {
                  if (this.onUpdate) {
                    this.onUpdate(appData);
                  }
                })
                .catch(err => {
                  warn(
                    'Error trying to deactivate a broken pattern kavuah on the database.'
                  );
                  error(err);
                });
            }
          }
        ]
      );
    }
    for (let reawakenedKavuah of reawakenedKavuahs) {
      Alert.alert(
        'Inactive Kavuah Pattern Matched',
        `This Entry seems to match the inactive Kavuah pattern of "${reawakenedKavuah.toString(
          true
        )}".` + '\nDo you wish to set this Kavuah to active?',
        [
          //Button 1
          {
            text: 'No',
            onPress: () => {
              return;
            }
          },
          //Button 2
          {
            text: 'Yes',
            onPress: () => {
              reawakenedKavuah.active = true;
              DataUtils.KavuahToDatabase(reawakenedKavuah)
                .then(() => {
                  if (this.onUpdate) {
                    this.onUpdate(appData);
                  }
                })
                .catch(err => {
                  warn(
                    'Error trying to activate an in-pattern-kavuah on the database.'
                  );
                  error(err);
                });
            }
          }
        ]
      );
    }
    for (let outOfPatternKavuah of outOfPatternKavuahs) {
      Alert.alert(
        'Kavuah Pattern Break',
        `This Entry does not seem to match the Kavuah pattern of "${outOfPatternKavuah.toString()}".` +
        '\nDo you wish to set this Kavuah to NOT Cancel Onah Beinonis?',
        [
          //Button 1
          {
            text: 'No',
            onPress: () => {
              return;
            }
          },
          //Button 2
          {
            text: 'Yes',
            onPress: () => {
              outOfPatternKavuah.cancelsOnahBeinunis = false;
              DataUtils.KavuahToDatabase(outOfPatternKavuah)
                .then(() => {
                  if (this.onUpdate) {
                    this.onUpdate(appData);
                  }
                })
                .catch(err => {
                  warn(
                    'Error trying to set a Kavuah to cancelsOnahBeinunis = false on the database.'
                  );
                  error(err);
                });
            }
          }
        ]
      );
    }
  }
  changeSDate(sdate) {
    const jdate = new jDate(sdate);
    this.setState({ jdate, showDatePicker: false });
  }
  render() {
    const sdate = this.state.jdate.getDate();
    const sdateBefore = new Date(sdate.valueOf() - 86400000);
    return (
      <View style={GeneralStyles.container}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <SideMenu
            onUpdate={this.onUpdate}
            appData={this.appData}
            navigator={this.props.navigation}
            currDate={this.state.jdate}
            helpUrl="Entries.html"
            helpTitle="Entries"
          />
          <ScrollView style={{ flex: 1 }}>
            <View style={GeneralStyles.formRow}>
              <Text style={GeneralStyles.label}>Jewish Date</Text>
              <JdateChooser
                jdate={this.state.jdate}
                setDate={jdate => this.setState({ jdate })}
              />
            </View>
            <View style={{ padding: 10 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#955'
                }}
              >
                You can choose by either Jewish or Secular Date
              </Text>
            </View>
            <View style={GeneralStyles.formRow}>
              <Text style={GeneralStyles.label}>Secular Date</Text>
              <View style={GeneralStyles.textInput}>
                <TouchableOpacity
                  onPress={() => this.setState({ showDatePicker: true })}
                >
                  <Text>{Utils.toStringDate(sdate)}</Text>
                </TouchableOpacity>
                <DateTimePicker
                  isVisible={this.state.showDatePicker}
                  date={sdate}
                  onConfirm={this.changeSDate}
                  onCancel={() => this.setState({ showDatePicker: false })}
                />
              </View>
            </View>
            <View style={GeneralStyles.formRow}>
              <Text style={GeneralStyles.label}>Onah - Day or Night?</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 15
                }}
              >
                <Text>Night</Text>
                <Switch
                  style={GeneralStyles.switch}
                  onValueChange={value =>
                    this.setState({
                      nightDay: value ? NightDay.Day : NightDay.Night
                    })
                  }
                  value={this.state.nightDay === NightDay.Day}
                />
                <Text>Day</Text>
              </View>
              {this.state.nightDay === NightDay.Night && (
                <View style={{ padding: 10, marginTop: 3 }}>
                  <Text>You have selected the night Onah.</Text>
                  <Text>
                    <Text style={{ fontWeight: 'bold', color: '#a66' }}>
                      Please make sure{' '}
                    </Text>
                    {`that the Period began on ${Utils.toStringDow(
                      sdateBefore,
                      NightDay.Night
                    )} after sunset (${this.sunsetText}), but before sunrise (${this.sunriseText
                      }) on ${Utils.dowEng[sdate.getDay()]} morning.`}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ padding: 10, marginTop: 7 }}>
              <Text style={{ fontSize: 12 }}>
                {`On ${sdate.toLocaleDateString()} in `}
                <Text style={{ fontWeight: 'bold' }}>{this.location.Name}</Text>
                ,{'\nSunrise: '}
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: '#668'
                  }}
                >
                  {this.sunriseText}
                </Text>
                {'    Sunset: '}
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: '#668'
                  }}
                >
                  {this.sunsetText}
                </Text>
                <Text style={{ fontStyle: 'italic' }}>
                  {
                    '\n\nDo not forget that after sunset, the Jewish Date changes.'
                  }
                </Text>
              </Text>
            </View>
            <View style={GeneralStyles.formRow}>
              <Text style={GeneralStyles.label}>Comments</Text>
              <TextInput
                style={GeneralStyles.textInput}
                onEndEditing={event =>
                  this.setState({
                    comments: event.nativeEvent.text
                  })
                }
                defaultValue={this.state.comments}
                placeholder="Enter any comments"
                multiline={true}
                maxLength={500}
              />
            </View>
            {(!this.state.showAdvancedOptions && (
              <TouchableOpacity
                style={{ margin: 7 }}
                onPress={() => this.setState({ showAdvancedOptions: true })}
              >
                <Text
                  style={{
                    color: '#66b',
                    fontSize: 13
                  }}
                >
                  Show Advanced Entry Options
                </Text>
              </TouchableOpacity>
            )) || (
                <View>
                  <View style={GeneralStyles.formRow}>
                    <Text style={[GeneralStyles.label, { fontSize: 11 }]}>
                      [Advanced] Not a halachic Vesset period. Should not generate
                      Flagged Dates
                    </Text>
                    <Switch
                      style={GeneralStyles.switch}
                      onValueChange={value =>
                        this.setState({
                          ignoreForFlaggedDates: value
                        })
                      }
                      value={!!this.state.ignoreForFlaggedDates}
                    />
                  </View>
                  <View style={GeneralStyles.formRow}>
                    <Text style={[GeneralStyles.label, { fontSize: 11 }]}>
                      [Advanced] Ignore this Entry in Kavuah calculations
                    </Text>
                    <Switch
                      style={GeneralStyles.switch}
                      onValueChange={value =>
                        this.setState({
                          ignoreForKavuah: value
                        })
                      }
                      value={!!this.state.ignoreForKavuah}
                    />
                  </View>
                </View>
              )}
            <View style={GeneralStyles.formRow}>
              <Text style={GeneralStyles.label}>
                Add a Hefsek Tahara Reminder
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 15
                }}
              >
                <Text>Don't add reminder</Text>
                <Switch
                  style={GeneralStyles.switch}
                  onValueChange={value =>
                    this.setState({
                      addReminder: value
                    })
                  }
                  value={this.state.addReminder}
                />
                <Text>Add reminder</Text>
              </View>
              {this.state.addReminder && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 15
                  }}
                >
                  <Text>Remind me on the </Text>
                  <NumberPicker
                    endNumber={15}
                    unitName="day"
                    suffixed={true}
                    value={this.state.reminderDay}
                    onChange={reminderDay => this.setState({ reminderDay })}
                  />
                  <Text> at </Text>
                  <TimeInput
                    selectedTime={this.state.reminderTime}
                    onConfirm={reminderTime => this.setState({ reminderTime })}
                  />
                </View>
              )}
            </View>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 11,
                color: '#444',
                padding: 20,
                textAlign: 'center'
              }}
            >
              Before continuing, please review the Date and Onah....
            </Text>
            <OnahSynopsis
              jdate={this.state.jdate}
              nightDay={this.state.nightDay}
            />
            <View style={GeneralStyles.btnAddNew}>
              <Button
                title={this.entry ? 'Save Changes' : 'Add This Entry'}
                onPress={this.entry ? this.updateEntry : this.addEntry}
                accessibilityLabel={
                  this.entry
                    ? 'Save Changes to this Entry'
                    : 'Add this new Entry'
                }
                color={GLOBALS.BUTTON_COLOR}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}
