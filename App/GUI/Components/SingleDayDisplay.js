import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    TouchableOpacity,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Utils from '../../Code/JCal/Utils';
import Zmanim from '../../Code/JCal/Zmanim';
import { popUpMessage, isLargeScreen } from '../../Code/GeneralUtils';
import { UserOccasion } from '../../Code/JCal/UserOccasion';
import {
    TaharaEvent,
    TaharaEventType,
} from '../../Code/Chashavshavon/TaharaEvent';
import DataUtils from '../../Code/Data/DataUtils';
/**
 * Display a home screen box for a single jewish date.
 *
 * PROPS ------------------------------
 *   jdate
 *   sdate - only supplied if there is a chance that the jdate is after sunset
 *   isToday
 *   appData
 *   navigator
 *   onUpdate
 *   lastEntryDate
 *   dayOfSeven
 *   isHefeskDay - is today the 5th day after the last entry?
 */
export default class SingleDayDisplay extends React.PureComponent {
    constructor(props) {
        super(props);
        this.navigator = props.navigator;
        this.newEntry = this.newEntry.bind(this);
        this.editEntry = this.editEntry.bind(this);
        this.newOccasion = this.newOccasion.bind(this);
        this.editOccasion = this.editOccasion.bind(this);
        this.showDateDetails = this.showDateDetails.bind(this);
        this.showProblems = this.showProblems.bind(this);
        this.changeLocation = this.changeLocation.bind(this);
        this.toggleTaharaEvent = this.toggleTaharaEvent.bind(this);
    }
    newEntry() {
        this.navigator.navigate('NewEntry', this.props);
    }
    newOccasion() {
        this.navigator.navigate('NewOccasion', this.props);
    }
    toggleTaharaEvent(taharaEventType) {
        const appData = this.props.appData,
            taharaEventsList = appData.TaharaEvents,
            previousEvent = taharaEventsList.find(
                te =>
                    Utils.isSameJdate(te.jdate, this.props.jdate) &&
                    te.taharaEventType === taharaEventType
            );
        if (!previousEvent) {
            const taharaEvent = new TaharaEvent(
                this.props.jdate,
                taharaEventType
            );
            DataUtils.TaharaEventToDatabase(taharaEvent).then(() => {
                taharaEventsList.push(taharaEvent);
                appData.taharaEventsList = TaharaEvent.sortList(
                    taharaEventsList
                );
                this.props.onUpdate(appData);
            });
        } else {
            const index = taharaEventsList.indexOf(previousEvent);
            DataUtils.DeleteTaharaEvent(previousEvent).then(() => {
                taharaEventsList.splice(index, 1);
                appData.TaharaEvents = taharaEventsList;
                this.props.onUpdate(appData);
            });
        }
    }
    showDateDetails() {
        this.navigator.navigate('DateDetails', this.props);
    }
    showProblems() {
        this.navigator.navigate('FlaggedDates', this.props);
    }
    changeLocation() {
        this.navigator.navigate('FindLocation', this.props);
    }
    editEntry(entry) {
        const hasKavuah = this.props.appData.KavuahList.some(
            k => !k.ignore && k.settingEntry.isSameEntry(entry)
        );
        if (hasKavuah) {
            popUpMessage(
                'This Entry has been set as "Setting Entry" for a Kavuah and can not be changed.',
                'Entry cannot be changed'
            );
        } else {
            this.navigator.navigate('NewEntry', { entry, ...this.props });
        }
    }
    editOccasion(occasion) {
        this.navigator.navigate('NewOccasion', { occasion, ...this.props });
    }
    render() {
        const { appData, jdate, isToday } = this.props,
            nowSdate = new Date(),
            location = appData.Settings.location,
            flag =
                appData.Settings.showProbFlagOnHome &&
                appData.ProblemOnahs.some(po =>
                    Utils.isSameJdate(po.jdate, jdate)
                ),
            occasions =
                appData.UserOccasions.length > 0
                    ? UserOccasion.getOccasionsForDate(
                          jdate,
                          appData.UserOccasions
                      )
                    : [],
            entries = appData.Settings.showEntryFlagOnHome
                ? appData.EntryList.list.filter(e =>
                      Utils.isSameJdate(e.date, jdate)
                  )
                : [],
            taharaEvents = appData.Settings.showEntryFlagOnHome
                ? appData.TaharaEvents.filter(te =>
                      Utils.isSameJdate(te.jdate, jdate)
                  )
                : [],
            sdate = jdate.getDate(),
            isDayOff = isToday && nowSdate.getDate() !== sdate.getDate(),
            currSdate = isDayOff ? nowSdate : sdate,
            todayText = isToday && (
                <Text style={styles.todayText}>
                    {`TODAY${isDayOff ? '*' : ''}`}
                </Text>
            ),
            isSpecialDay =
                jdate.DayOfWeek === 6 || jdate.getMajorHoliday(location.Israel),
            //We only show the hefsek if there wasn't an actual hefsek on that day
            isPossibleHefsekDay =
                appData.Settings.showEntryFlagOnHome &&
                this.props.isHefeskDay &&
                !taharaEvents.some(
                    te => te.taharaEventType === TaharaEventType.Hefsek
                ),
            dailyInfos = jdate.getHolidays(location.Israel),
            isYomTov = jdate.isYomTov(location.Israel),
            dailyInfoText = dailyInfos.length > 0 && (
                <Text>{dailyInfos.join('\n')}</Text>
            ),
            suntimesMishor = Zmanim.getSunTimes(jdate, location, false),
            suntimes = Zmanim.getSunTimes(jdate, location, true),
            sunrise =
                suntimesMishor && suntimesMishor.sunrise
                    ? Utils.getTimeString(suntimesMishor.sunrise)
                    : 'Sun does not rise',
            sunset =
                suntimes && suntimes.sunset
                    ? Utils.getTimeString(suntimes.sunset)
                    : 'Sun does not set',
            candleLighting = jdate.hasCandleLighting() && (
                <Text>
                    {'Candle-lighting: ' +
                        Utils.getTimeString(
                            Zmanim.getCandleLightingFromSunTimes(
                                suntimes,
                                location
                            )
                        )}
                </Text>
            ),
            eiruvTavshilin = jdate.hasEiruvTavshilin(location.Israel) && (
                <Text style={{ fontWeight: 'bold' }}>Eiruv Tavshilin</Text>
            ),
            backgroundColor =
                entries && entries.length > 0
                    ? '#fee'
                    : flag
                    ? '#fe9'
                    : isPossibleHefsekDay
                    ? '#f1fff1'
                    : isToday
                    ? '#e2e2f0'
                    : isSpecialDay
                    ? '#eef'
                    : '#fff',
            menuIconSize = isLargeScreen() ? 20 : 15,
            hasHefsek = taharaEvents.some(
                te => te.taharaEventType === TaharaEventType.Hefsek
            ),
            hasShailah = taharaEvents.some(
                te => te.taharaEventType === TaharaEventType.Shailah
            ),
            hasMikvah = taharaEvents.some(
                te => te.taharaEventType === TaharaEventType.Mikvah
            );
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: backgroundColor },
                ]}>
                <View>
                    <View style={styles.mainSectionView}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.dateNumEng}>
                                {currSdate.getDate().toString()}
                            </Text>
                            {todayText}
                            <Text style={styles.dateNumHeb}>
                                {Utils.toJNum(jdate.Day)}
                            </Text>
                        </View>
                        <Text style={styles.date}>
                            <Text style={styles.dateHeb}>
                                {jdate.toString()}
                            </Text>
                            <Text>{'\n'}</Text>
                            <Text style={styles.dateEng}>
                                {Utils.toStringDate(currSdate, !isDayOff)}
                            </Text>
                        </Text>
                        {dailyInfoText}
                        {candleLighting}
                        {eiruvTavshilin}
                        {!isYomTov && (
                            <Text>{`Sedra of the week: ${jdate
                                .getSedra(location.Israel)
                                .map(s => s.eng)
                                .join(' - ')}`}</Text>
                        )}
                        <View style={styles.bottomSection}>
                            <View style={{ flex: 0 }}>
                                <TouchableOpacity onPress={this.changeLocation}>
                                    <Text style={styles.location}>
                                        {'In ' + location.Name}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableWithoutFeedback
                                    onPress={this.showDateDetails}>
                                    <View>
                                        <Text>{'Sunrise: ' + sunrise}</Text>
                                        <Text>{'Sunset: ' + sunset}</Text>
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 'bold',
                                            }}>
                                            More...
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View
                                style={{
                                    flex: 0,
                                    maxWidth: '50%',
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                }}>
                                {flag && (
                                    <FlagComponent
                                        onPress={this.showProblems}
                                    />
                                )}
                                {appData.Settings.showEntryFlagOnHome && (
                                    <View>
                                        <DaysLastEntryComponent
                                            lastEntryDate={
                                                this.props.lastEntryDate
                                            }
                                            currDate={jdate}
                                            onPress={() =>
                                                this.navigator.navigate(
                                                    'Entries',
                                                    { ...this.props }
                                                )
                                            }
                                        />
                                        <EntriesComponent
                                            list={entries}
                                            edit={this.editEntry}
                                        />
                                        {isPossibleHefsekDay && (
                                            <PossibleHefsekComponent
                                                onPress={() =>
                                                    this.toggleTaharaEvent(
                                                        TaharaEventType.Hefsek
                                                    )
                                                }
                                            />
                                        )}
                                        <DayOfSevenComponent
                                            dayOfSeven={this.props.dayOfSeven}
                                            hasMikvah={taharaEvents.some(
                                                te =>
                                                    te.taharaEventType ===
                                                    TaharaEventType.Mikvah
                                            )}
                                            onPress={() =>
                                                this.toggleTaharaEvent(
                                                    TaharaEventType.Mikvah
                                                )
                                            }
                                        />
                                        <TaharaEventsComponent
                                            list={taharaEvents}
                                            remove={this.toggleTaharaEvent}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                    <OccasionsComponent
                        list={occasions}
                        edit={this.editOccasion}
                        date={jdate}
                    />
                    {isDayOff && (
                        <DayOffComponent dayOfWeek={jdate.DayOfWeek} />
                    )}
                </View>
                <View style={styles.menuView}>
                    <TouchableWithoutFeedback
                        onPress={this.newEntry}
                        style={{ flex: 1 }}>
                        <View style={styles.menuItemView}>
                            <Icon
                                color="#aac"
                                name="remove-red-eye"
                                size={menuIconSize}
                            />
                            <Text style={styles.menuItemText}>Entry</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                        onPress={this.newOccasion}
                        style={{ flex: 1 }}>
                        <View style={styles.menuItemView}>
                            <Icon
                                color="#aac"
                                name="event"
                                size={menuIconSize}
                            />
                            <Text style={styles.menuItemText}>Event</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    {appData.Settings.showEntryFlagOnHome && !hasHefsek && (
                        <TouchableWithoutFeedback
                            onPress={() =>
                                this.toggleTaharaEvent(TaharaEventType.Hefsek)
                            }
                            style={{ flex: 1 }}>
                            <View
                                style={[
                                    styles.menuItemView,
                                    hasMikvah || hasShailah
                                        ? styles.lastMenuView
                                        : null,
                                ]}>
                                <Icon
                                    color="#aac"
                                    name="flare"
                                    size={menuIconSize}
                                />
                                <Text style={styles.menuItemText}>Hefsek</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                    {appData.Settings.showEntryFlagOnHome && !hasShailah && (
                        <TouchableWithoutFeedback
                            onPress={() =>
                                this.toggleTaharaEvent(TaharaEventType.Shailah)
                            }
                            style={{ flex: 1 }}>
                            <View
                                style={[
                                    styles.menuItemView,
                                    hasMikvah ? styles.lastMenuView : null,
                                ]}>
                                <Icon
                                    color="#aac"
                                    name="report-problem"
                                    size={menuIconSize}
                                />
                                <Text style={styles.menuItemText}>Shailah</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                    {appData.Settings.showEntryFlagOnHome && !hasMikvah && (
                        <TouchableWithoutFeedback
                            onPress={() =>
                                this.toggleTaharaEvent(TaharaEventType.Mikvah)
                            }
                            style={{ flex: 1 }}>
                            <View
                                style={[
                                    styles.menuItemView,
                                    styles.lastMenuView,
                                ]}>
                                <Icon
                                    color="#aac"
                                    name="beenhere"
                                    size={menuIconSize}
                                />
                                <Text style={styles.menuItemText}>Mikvah</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </View>
            </View>
        );
    }
}

function getYearText(occ, date) {
    const yearText = occ.getYearString(date);
    if (yearText) {
        return <Text style={styles.occasionYearText}>{yearText}</Text>;
    } else {
        return null;
    }
}

function EntriesComponent(props) {
    return (
        props.list.length > 0 && (
            <View style={styles.additionsViews}>
                {props.list.map((e, i) => (
                    <TouchableOpacity key={i} onPress={() => props.edit(e)}>
                        <Text style={styles.entriesText}>
                            {e.toKnownDateString()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        )
    );
}

function OccasionsComponent(props) {
    if (props.list.length > 0) {
        return (
            <View style={styles.eventsView}>
                {props.list.map((o, i) => (
                    <TouchableOpacity key={i} onPress={() => props.edit(o)}>
                        <View
                            style={[
                                styles.occasionBadge,
                                { backgroundColor: o.color },
                            ]}>
                            <Icon size={14} color="#ffe" name="event" />
                            <Text style={styles.occasionText}>{o.title}</Text>
                            {getYearText(o, props.date)}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }
    return null;
}

function PossibleHefsekComponent(props) {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={styles.additionsViews}>
                <Text style={styles.hefsekText}>Hefsek Tahara Permissible</Text>
            </View>
        </TouchableOpacity>
    );
}

function FlagComponent(props) {
    return (
        <TouchableOpacity style={styles.additionsViews} onPress={props.onPress}>
            <View style={styles.additionsViews}>
                <View style={styles.flagView}>
                    <Icon size={15} name="flag" color={'#fff'} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

function DayOffComponent(props) {
    return (
        <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text style={styles.dayOffMessage}>
                {'* NOTE: As it is currently after Sunset,\n' +
                    `  the correct Jewish Day is ${
                        Utils.dowEng[props.dayOfWeek]
                    }.`}
            </Text>
        </View>
    );
}

function DaysLastEntryComponent(props) {
    if (props.lastEntryDate) {
        const dayNum = props.lastEntryDate.diffDays(props.currDate) + 1;
        if (dayNum > 1) {
            return (
                <TouchableOpacity onPress={props.onPress}>
                    <View
                        style={[
                            styles.additionsViews,
                            { flexDirection: 'row' },
                        ]}>
                        <Icon size={12} color="#e88" name="remove-red-eye" />
                        <Text
                            style={{
                                fontSize: 10,
                                color: '#e55',
                                paddingLeft: 3,
                            }}>
                            {Utils.toSuffixed(dayNum) + ' day'}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }
    }
    return null;
}

function DayOfSevenComponent(props) {
    if (props.dayOfSeven && props.dayOfSeven > 0) {
        return (
            <View style={styles.additionsViews}>
                <Text
                    style={{
                        fontSize: 10,
                        color: '#99b',
                        textAlign: 'center',
                    }}>
                    {Utils.toSuffixed(props.dayOfSeven) +
                        ' day of 7\nfrom Hefsek Tahara'}
                </Text>
                {props.dayOfSeven === 7 && !props.hasMikvah && (
                    <TouchableOpacity onPress={props.onPress}>
                        <Text
                            style={{
                                fontSize: 10,
                                color: '#55e',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                paddingTop: 4,
                            }}>
                            Mikvah possible after nightfall
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return null;
}

function TaharaEventsComponent(props) {
    if (props.list.length > 0) {
        return (
            <View style={styles.badgesOuterView}>
                {props.list.map((te, i) => {
                    let bgColor, iconName;
                    switch (te.taharaEventType) {
                        case TaharaEventType.Hefsek:
                            bgColor = '#d4ffd4';
                            iconName = 'flare';
                            break;
                        case TaharaEventType.Shailah:
                            bgColor = '#f1d484';
                            iconName = 'report-problem';
                            break;
                        case TaharaEventType.Mikvah:
                            bgColor = '#d4d4ff';
                            iconName = 'beenhere';
                            break;
                        case TaharaEventType.Bedika:
                            bgColor = '#ffd4f1';
                            iconName = 'remove-red-eye';
                            break;
                    }
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => props.remove(te.taharaEventType)}>
                            <View
                                style={[
                                    styles.badgeView,
                                    { backgroundColor: bgColor },
                                ]}>
                                <Icon
                                    color="#555"
                                    name={iconName}
                                    size={isLargeScreen() ? 16 : 11}
                                />
                                <Text style={styles.taharaEventsText}>
                                    {te.toTypeString()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: '#777',
        borderRadius: 6,
        padding: 0,
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    mainSectionView: {
        marginTop: 5,
        marginLeft: 15,
        marginRight: 15,
        flex: 1,
    },
    date: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    todayText: {
        color: '#800',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    dateNumEng: {
        color: '#080',
        textAlign: 'left',
        fontSize: 23,
        fontWeight: 'bold',
        flex: 1,
    },
    dateNumHeb: {
        color: '#008',
        textAlign: 'right',
        fontSize: 23,
        fontWeight: 'bold',
        textAlignVertical: 'top',
        flex: 1,
    },
    dateEng: { color: '#080' },
    dateHeb: { color: '#008' },
    location: {
        marginTop: 5,
        color: '#800',
        fontWeight: 'bold',
    },
    flagView: {
        backgroundColor: '#f00',
        alignItems: 'center',
        borderRadius: 40,
        padding: 6,
    },
    additionsViews: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    eventsView: {
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 10,
    },
    entriesText: {
        color: '#e55',
        fontWeight: 'bold',
        fontSize: 10,
        textAlign: 'center',
    },
    badgesOuterView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    badgeView: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 3,
        margin: 2,
        borderRadius: 5,
    },
    taharaEventsText: {
        color: '#555',
        fontSize: 10,
        marginLeft: 2,
    },
    occasionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderRadius: 5,
        marginBottom: 4,
    },
    occasionText: {
        color: '#ffe',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 4,
    },
    occasionYearText: {
        color: '#ffe',
        fontSize: 10,
        fontStyle: 'italic',
        paddingTop: 2,
        marginLeft: 4,
    },
    hefsekText: {
        fontSize: 10,
        color: '#050',
        fontStyle: 'italic',
    },
    dayOffMessage: {
        fontSize: 10,
        color: '#955',
    },
    menuView: {
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 3,
        paddingBottom: 2,
        marginTop: 2,
        backgroundColor: '#00000010',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    menuItemView: {
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '#0000020c',
        flex: 1,
    },
    lastMenuView: { borderRightWidth: 0 },
    menuItemText: {
        fontSize: isLargeScreen() ? 13 : 9,
        color: '#889',
    },
    bottomSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 3,
        marginBottom: 7,
    },
});
