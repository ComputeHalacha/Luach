import jDate from './jDate';
import Utils from './Utils';

const UserOccasionTypes = Object.freeze({
    OneTime: 1,
    HebrewDateRecurringYearly: 2,
    HebrewDateRecurringMonthly: 4,
    SecularDateRecurringYearly: 8,
    SecularDateRecurringMonthly: 16
});

class UserOccasion {
    constructor(title, occasionType, dateAbs, comments, occasionId) {
        this.title = title;
        this.occasionType = occasionType;
        this.dateAbs = dateAbs;
        this.comments = comments;
        this.occasionId = occasionId;
    }
    toString() {
        switch (this.occasionType) {
            case UserOccasionTypes.OneTime:
                return 'One time event on ' + this.jdate.toString(true) + '  (' +
                    Utils.toStringDate(this.sdate, true) + ')';
            case UserOccasionTypes.HebrewDateRecurringYearly:
                return 'Yearly event on the ' + Utils.toSuffixed(this.jdate.Day) +
                    ' day of ' + Utils.jMonthsEng[this.jdate.Month];
            case UserOccasionTypes.HebrewDateRecurringMonthly:
                return 'Monthly event on the ' + Utils.toSuffixed(this.jdate.Day)
                    + ' day of each Jewish month';
            case UserOccasionTypes.SecularDateRecurringYearly:
                return 'Yearly event on the ' + Utils.toSuffixed(this.sdate.getDate()) +
                    ' day of ' + Utils.sMonthsEng[this.sdate.getMonth()];
            case UserOccasionTypes.SecularDateRecurringMonthly:
                return 'Monthly event on the ' + Utils.toSuffixed(this.sdate.getDate()) +
                    ' day of each Secular month';
        }
    }
    get jdate() {
        if (!this.jdate) {
            this.jdate = new jDate(this.dateAbs);
        }
        return this.jdate;
    }
    get sdate() {
        if (!this.sdate) {
            this.sdate = jDate.sdFromAbs(this.dateAbs);
        }
        return this.sdate;
    }
    get hasId() {
        return !!this.occasionId;
    }
    static getOccasionsForDate(jdate, allOccasions) {
        return allOccasions.filter(o => {
            switch (o.occasionType) {
                case UserOccasionTypes.OneTime:
                    return o.dateAbs === jdate.Abs;
                case UserOccasionTypes.HebrewDateRecurringYearly:
                    return o.Month === jDate.Month && o.Day === jdate.Day;
                case UserOccasionTypes.HebrewDateRecurringMonthly:
                    return o.Day === jdate.Day;
                case UserOccasionTypes.SecularDateRecurringYearly:
                case UserOccasionTypes.SecularDateRecurringMonthly:
                    const sdate1 = jdate.getDate(),
                        sdate2 = o.getDate();
                    if (o.occasionType === UserOccasionTypes.SecularDateRecurringYearly) {
                        return sdate1.getMonth() === sdate2.getMonth() && sdate1.getDate() === sdate2.getDate();
                    }
                    else {
                        return sdate1.getDate() === sdate2.getDate();
                    }
            }
        });
    }
}

export { UserOccasionTypes, UserOccasion };