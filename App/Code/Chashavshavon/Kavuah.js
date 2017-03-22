import KavuahType from './KavuahType';
import Utils from '../JCal/Utils';
import NightDay from './NightDay';

export default class Kavuah {
    constructor(kavuaType, settingEntry, specialNumber, cancelsOnahBeinunis, notKavuahSetter) {
        this.kavuaType = kavuaType;
        this.settingEntry = settingEntry;
        this.specialNumber = specialNumber;
        this.cancelsOnahBeinunis = !!cancelsOnahBeinunis;
        this.notKavuahSetter = !!notKavuahSetter;
        this.active = true;
    }
    toString() {
        let txt = this.settingEntry.onah.nightDay === NightDay.Night ? "Nighttime " : "Daytime ";
        switch (this.kavuaType) {
            case KavuahType.Haflagah:
                txt += `every ${this.settingEntry.haflaga.toString()} days`;
                break;
            case KavuahType.DayOfMonth:
                txt = `the ${Utils.toSuffixed(this.settingEntry.onah.jdate.Day)} day of the Jewish Month`;
                break;
            case KavuahType.DayOfWeek:
                txt += `${Utils.dowEng[this.settingEntry.onah.jdate.getDayOfWeek()]} every ${Utils.toSuffixed(this.specialNumber)} week`;
                break;
            case KavuahType.Sirug:
                txt += `the ${Utils.toSuffixed(this.settingEntry.onah.jdate.Day)} day of every ${Utils.toSuffixed(this.specialNumber)} month`;
                break;
            case Chashavshavon.KavuahType.HaflagaMaayanPasuach:
                txt += `every ${this.settingEntry.specialNumber.toString()} days (through Ma'ayan Pasuach)`;
                break;
            case Chashavshavon.KavuahType.DayOfMonthMaayanPasuach:
                txt += `the ${Utils.toSuffixed(this.specialNumber)} day of the Jewish Month (through Ma'ayan Pasuach)`;
                break;
            case KavuahType.DilugHaflaga:
                txt += `following the interval pattern of ${this.specialNumber < 0 ? "-" : "+"} ${Math.Abs(this.specialNumber).toString()} days`;
                break;
            case KavuahType.DilugDayOfMonth:
                txt += `for days of the month following the interval pattern of ${this.specialNumber < 0 ? "-" : "+"} ${Math.Abs(this.specialNumber).toString()} days`;
                break;
        }

        return txt;
    }
}