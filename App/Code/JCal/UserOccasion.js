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
    static defaultColor = '#b96';

    constructor(title, occasionType, dateAbs, color, comments, occasionId) {
        this.title = title;
        this.occasionType = occasionType;
        //This should only be changed by setting the jdate or sdate properties
        this.dateAbs = dateAbs;
        this.color = color || UserOccasion.defaultColor;
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
    isSameOccasion(occasion) {
        if (!occasion) {
            return false;
        }
        return this.title === occasion.title &&
            this.occasionType === occasion.occasionType &&
            this.dateAbs === occasion.dateAbs &&
            this.color === occasion.color &&
            this.comments === occasion.comments;
    }
    isCustomColor() {
        return this.color !== UserOccasion.defaultColor;
    }
    clone() {
        return new UserOccasion(
            this.title,
            this.occasionType,
            this.dateAbs,
            this.color,
            this.comments,
            this.occasionId);
    }
    get jdate() {
        if (!this._jdate) {
            this._jdate = new jDate(this.dateAbs);
        }
        return this._jdate;
    }
    set jdate(jd) {
        this._jdate = jd;
        this.dateAbs = jd.Abs;
        this._sdate = jd.getDate();
    }
    get sdate() {
        if (!this._sdate) {
            this._sdate = jDate.sdFromAbs(this.dateAbs);
        }
        return this._sdate;
    }
    set sdate(sd) {
        this._jdate = new jDate(sd);
        this._sdate = sd;
        this.dateAbs = this._jdate.Abs;
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