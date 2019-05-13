import Location from './JCal/Location';
import { setDefault } from './GeneralUtils';
import DataUtils from './Data/DataUtils';
import Utils from './JCal/Utils';

export default class Settings {
    constructor(args) {
        this.location = args.location || Location.getLakewood();
        this.showOhrZeruah = setDefault(args.showOhrZeruah, true);
        this.keepThirtyOne = setDefault(args.keepThirtyOne, true);
        this.onahBeinunis24Hours = setDefault(args.onahBeinunis24Hours, true);
        this.numberMonthsAheadToWarn = setDefault(
            args.numberMonthsAheadToWarn,
            12
        );
        /** This setting is for the Ta"z.
         *  Causes flagging of Onah Beinonis's days 30, 31 and Haflaga
         *  even if there was another Entry in middle
         *  Also causes to keep flagging any haflaga that was not surpassed afterwards. */
        this.keepLongerHaflagah = !!args.keepLongerHaflagah;
        this.dilugChodeshPastEnds = setDefault(args.dilugChodeshPastEnds, true);
        this.haflagaOfOnahs = !!args.haflagaOfOnahs;
        this.kavuahDiffOnahs = !!args.kavuahDiffOnahs;
        this.calcKavuahsOnNewEntry = setDefault(
            args.calcKavuahsOnNewEntry,
            true
        );
        this.showProbFlagOnHome = setDefault(args.showProbFlagOnHome, true);
        this.showEntryFlagOnHome = setDefault(args.showEntryFlagOnHome, true);
        this.navigateBySecularDate = !!args.navigateBySecularDate;
        this.showIgnoredKavuahs = !!args.showIgnoredKavuahs;
        this.noProbsAfterEntry = setDefault(args.noProbsAfterEntry, true);
        this.hideHelp = !!args.hideHelp;
        //If a reminders field is null, we won't show the reminders
        this.remindBedkMornTime = Utils.fromSimpleTimeString(
            args.remindBedkMornTime
        );
        this.remindBedkAftrnHour = args.remindBedkAftrnHour;
        this.remindMikvahTime = Utils.fromSimpleTimeString(
            args.remindMikvahTime
        );
        this.remindDayOnahHour = args.remindDayOnahHour;
        this.remindNightOnahHour = args.remindNightOnahHour;
        this.discreet = setDefault(args.discreet, true);
        this.requirePIN = !!args.requirePIN;
        this.PIN = setDefault(args.PIN, '1234');
    }
    async save() {
        await DataUtils.SettingsToDatabase(this);
    }
    static async setCurrentLocation(location) {
        await DataUtils.SetCurrentLocationOnDatabase(location);
        global.GlobalAppData.Settings.location = location;
    }
    isSameSettings(other) {
        if (!!this != !!other) {
            return false;
        }
        return (
            (!this && !other) ||
            (this.location === other.location &&
                this.showOhrZeruah === other.showOhrZeruah &&
                this.keepThirtyOne === other.keepThirtyOne &&
                this.onahBeinunis24Hours === other.onahBeinunis24Hours &&
                this.numberMonthsAheadToWarn ===
                    other.numberMonthsAheadToWarn &&
                this.keepLongerHaflagah === other.keepLongerHaflagah &&
                this.dilugChodeshPastEnds === other.dilugChodeshPastEnds &&
                this.haflagaOfOnahs === other.haflagaOfOnahs &&
                this.kavuahDiffOnahs === other.kavuahDiffOnahs &&
                this.calcKavuahsOnNewEntry === other.calcKavuahsOnNewEntry &&
                this.showProbFlagOnHome === other.showProbFlagOnHome &&
                this.showEntryFlagOnHome === other.showEntryFlagOnHome &&
                this.navigateBySecularDate === other.navigateBySecularDate &&
                this.showIgnoredKavuahs === other.showIgnoredKavuahs &&
                this.noProbsAfterEntry === other.noProbsAfterEntry &&
                this.hideHelp === other.hideHelp &&
                this.discreet === other.discreet &&
                Utils.isSameTime(
                    this.remindBedkMornTime,
                    other.remindBedkMornTime
                ) &&
                this.remindBedkAftrnHour === other.remindBedkAftrnHour &&
                Utils.isSameTime(
                    this.remindMikvahTime,
                    other.remindMikvahTime
                ) &&
                this.remindDayOnahHour === other.remindDayOnahHour &&
                this.remindNightOnahHour === other.remindNightOnahHour &&
                this.requirePIN === other.requirePIN &&
                this.PIN === other.PIN)
        );
    }
}
