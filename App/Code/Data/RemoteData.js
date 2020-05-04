import DataUtils from './DataUtils';
import Settings from '../Settings';
import Entry from '../Chashavshavon/Entry';
import { Kavuah } from '../Chashavshavon/Kavuah';
import { NightDay } from '../Chashavshavon/Onah';
import EntryList from '../Chashavshavon/EntryList';
import Utils from '../JCal/Utils';
import {
    resetDayOnahReminders,
    resetNightOnahReminders,
} from '../Notifications';
import {
    log,
    error,
    warn,
    tryToGuessLocation,
    isFirstTimeRun,
    isNullishOrFalse,
} from '../GeneralUtils';

function get() {
    var locations = 
        `name: string,
        israel: bool,
        latitude: number,
        longitude: number,
        utcoffset: number,
        elevation: number,
        candles: number
        locationId: number`;

    var settings = 
        `locationId: number,
        showOhrZeruah: bool,
        keepThirtyOne: bool,
        onahBeinunis24Hours: bool,
        numberMonthsAheadToWarn: number,
        keepLongerHaflagah: bool,
        cheshbonKavuahByCheshbon: bool,
        haflagaOfOnahs: bool,
        kavuahDiffOnahs: bool,
        calcKavuahsOnNewEntry: bool,
        showProbFlagOnHome: bool,
        showEntryFlagOnHome: bool,
        navigateBySecularDate: bool,
        showIgnoredKavuahs: bool,
        noProbsAfterEntry: bool,
        hideHelp: bool,
        discreet: bool,
        remindBedkMornTime: bool,
        remindBedkAftrnHour: bool,
        remindMikvahTime: bool,
        remindDayOnahHour: bool,
        remindNightOnahHour: bool,
        requirePIN: bool,
        PIN: number,
        remoteUserName: string,
        remotePassword: string`;

    var occasions = 
        `title: string,
        type:{
            OneTime: 1,
            HebrewDateRecurringYearly: 2,
            HebrewDateRecurringMonthly: 4,
            SecularDateRecurringYearly: 8,
            SecularDateRecurringMonthly: 16,
        },
        dateAbs: number,
        color: string,
        comments: string,
        occasionId: number`;

    var entries = 
        `date: number,
        nightDay:{
            Night: -1,
            Day: 1,
        },
        ignoreForFlaggedDates: bool,
        ignoreForKavuah: bool,
        comments: string,
        entryId: number`;
    
    var kavuahs =
        `kavuahType:{
            Haflagah: 1,
            DayOfMonth: 2,
            DayOfWeek: 4,
            Sirug: 8,
            DilugHaflaga: 16,
            DilugDayOfMonth: 32,
            HaflagaMaayanPasuach: 64,
            DayOfMonthMaayanPasuach: 128,
            HafalagaOnahs: 256}, 
        settingEntryId: number,
        specialNumber: number,
        cancelsOnahBeinunis: bool,
        active: bool,
        ignore: bool
        kavuahId: number`;
    
    var taharaEvents = 
        `taharaEventId: number,
        dateAbs: number,
        taharaEventType:{
            Hefsek: 1,
            Bedika: 2,
            Shailah: 4,
            Mikvah: 8,
        }`;
    
}