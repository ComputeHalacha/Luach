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
        let str = this.title + ' - ';
        switch (this.occasionType) {
            case UserOccasionTypes.OneTime:
                str += 'One time event on ' + this.jdate.toString(true) + '  (' +
                    Utils.toStringDate(this.sdate, true) + ')';
                break;
            case UserOccasionTypes.HebrewDateRecurringYearly:
                str += 'Yearly event on the ' + Utils.toSuffixed(this.jdate.Day) +
                    ' day of ' + Utils.jMonthsEng[this.jdate.Month];
                break;
            case UserOccasionTypes.HebrewDateRecurringMonthly:
                str += 'Monthly event on the ' + Utils.toSuffixed(this.jdate.Day)
                    + ' day of each Jewish month';
                break;
            case UserOccasionTypes.SecularDateRecurringYearly:
                str += 'Yearly event on the ' + Utils.toSuffixed(this.sdate.getDate()) +
                    ' day of ' + Utils.sMonthsEng[this.sdate.getMonth()];
                break;
            case UserOccasionTypes.SecularDateRecurringMonthly:
                str += 'Monthly event on the ' + Utils.toSuffixed(this.sdate.getDate()) +
                    ' day of each Secular month';
                break;
        }
        return str;
    }
    get jdate() {
        if (!this._jdate) {
            this._jdate = new jDate(this.dateAbs);
        }
        return this._jdate;
    }
    get sdate() {
        if (!this._sdate) {
            this._sdate = jDate.sdFromAbs(this.dateAbs);
        }
        return this._sdate;
    }
    get hasId() {
        return !!this.occasionId;
    }
    static getOccasionsForDate(jdate, allOccasions) {
        return allOccasions.filter(o => {
            const ojDate = o.jdate;
            switch (o.occasionType) {
                case UserOccasionTypes.OneTime:
                    return o.dateAbs === jdate.Abs;
                case UserOccasionTypes.HebrewDateRecurringYearly:
                    return ojDate.Month === jdate.Month && ojDate.Day === jdate.Day;
                case UserOccasionTypes.HebrewDateRecurringMonthly:
                    return ojDate.Day === jdate.Day;
                case UserOccasionTypes.SecularDateRecurringYearly:
                case UserOccasionTypes.SecularDateRecurringMonthly:
                    {
                        const sdate1 = jdate.getDate(),
                            sdate2 = ojDate.getDate();
                        //For both secualr occasion types, the day of the month must match
                        if (sdate1.getDate() !== sdate2.getDate()) {
                            return false;
                        }
                        else {
                            //Now that the day matches, for a mothly occasion, the match is confirmed.
                            return o.occasionType === UserOccasionTypes.SecularDateRecurringMonthly ||
                                //For a  yearly occasion, the month must also match
                                sdate1.getMonth() === sdate2.getMonth();
                        }
                    }
            }
        });
    }
}

export { UserOccasionTypes, UserOccasion };