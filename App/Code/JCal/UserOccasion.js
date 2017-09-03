import jDate from './jDate';
import Utils from './Utils';

const UserOccasionTypes = Object.freeze({
    OneTime: 1,
    HebrewDateRecurringYearly: 2,
    HebrewDateRecurringMonthly: 4,
    SecularDateRecurringYearly: 8,
    SecularDateRecurringMonthly: 16
});

/**
 * An Occasion or Event.
 *
 * Note, the terms "Occasion" and "Event" are used interchangeablly in code, comments and documentation.
 */
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
    /**
     * Returns a short description of the current Occasion/Event
     * @param {Boolean} noOriginalDate Set to true to refrain from showing the setting date.
     */
    toString(noOriginalDate) {
        switch (this.occasionType) {
            case UserOccasionTypes.OneTime:
                return 'One time event on ' + this.jdate.toString() + ' - ' +
                    Utils.toStringDate(this.sdate, true, true);
            case UserOccasionTypes.HebrewDateRecurringYearly:
                return this.jdate.toString() + '  (' +
                    (noOriginalDate ? '' : this.sdate.toLocaleDateString() + ').\n') +
                    'Yearly event on the ' + Utils.toSuffixed(this.jdate.Day) +
                    ' day of ' + Utils.jMonthsEng[this.jdate.Month];
            case UserOccasionTypes.HebrewDateRecurringMonthly:
                return this.jdate.toString() + '  (' +
                    (noOriginalDate ? '' : this.sdate.toLocaleDateString() + ').\n') +
                    'Monthly event on the ' + Utils.toSuffixed(this.jdate.Day)
                    + ' day of each Jewish month';
            case UserOccasionTypes.SecularDateRecurringYearly:
                return (noOriginalDate ? '' : Utils.toStringDate(this.sdate, false) + '  (' +
                    this.jdate.toShortString(false) + ').\n') +
                    'Yearly event on the ' + Utils.toSuffixed(this.sdate.getDate()) +
                    ' day of ' + Utils.sMonthsEng[this.sdate.getMonth()];
            case UserOccasionTypes.SecularDateRecurringMonthly:
                return (noOriginalDate ? '' : Utils.toStringDate(this.sdate, false) + '  (' +
                    this.jdate.toShortString(false) + ').\n') +
                    'Monthly event on the ' + Utils.toSuffixed(this.sdate.getDate()) +
                    ' day of each Secular month';
        }
    }
    /**
     * If the given date matches any iteration of an annual Occasion,
     * returns the year number for that iteration in the format: "5th year"
     * @param {jDate | Date} date Can be either a jDate or a Javascript Date
     */
    getYearString(date) {
        if (!date) {
            return '';
        }
        else if (this.occasionType === UserOccasionTypes.HebrewDateRecurringYearly) {
            const jdate = ((date instanceof jDate) ? date : new jDate(date));
            if (jdate.Year > this.jdate.Year && jdate.Month === this.jdate.Month &&
                jdate.Day === this.jdate.Day) {
                return `${Utils.toSuffixed(jdate.Year - this.jdate.Year)} year`;
            }
        }
        else if (this.occasionType === UserOccasionTypes.SecularDateRecurringYearly) {
            const sdate = ((date instanceof Date) ? date : date.getDate());
            if (sdate.getFullYear() > this.sdate.getFullYear() &&
                sdate.getMonth() === this.sdate.getMonth() &&
                sdate.getDate() === this.sdate.getDate()) {
                return `${Utils.toSuffixed(sdate.getFullYear() - this.sdate.getFullYear())} year`;
            }
        }
        return '';
    }
    /**
     * Returns the year of the latest anniversary for thsi occasion.
     * Only returns a value for annual events.
     */
    getCurrentYear() {
        const jdate = this.getPreviousInstance();
        if (this.occasionType === UserOccasionTypes.HebrewDateRecurringYearly) {
            return jdate.Year - this.jdate.Year;
        }
        else if (this.occasionType === UserOccasionTypes.SecularDateRecurringYearly) {
            const sdate = jdate.getDate();
            return sdate.getFullYear() - this.sdate.getFullYear();
        }
    }
    /**
     * Gets the jdate of the next instance of a recurring event.
     */
    getNextInstance() {
        const nowSd = new Date(),
            nowJd = new jDate(nowSd);
        let jd, sd;
        switch (this.occasionType) {
            case UserOccasionTypes.HebrewDateRecurringYearly:
                jd = new jDate(nowJd.Year, this.jdate.Month, this.jdate.Day);
                while (jd.getDate() < nowSd) {
                    jd = jd.addYears(1);
                }
                return jd;
            case UserOccasionTypes.HebrewDateRecurringMonthly:
                jd = new jDate(nowJd.Year, nowJd.Month, this.jdate.Day);
                while (jd.getDate() < nowSd) {
                    jd = jd.addMonths(1);
                }
                return jd;
            case UserOccasionTypes.SecularDateRecurringYearly:
                sd = new Date(nowSd.getFullYear(), this.sdate.getMonth(), this.sdate.getDate() + 1);
                while (sd < nowSd) {
                    sd.setFullYear(sd.getFullYear() + 1);
                }
                return new jDate(sd);
            case UserOccasionTypes.SecularDateRecurringMonthly:
                sd = new Date(nowSd.getFullYear(), nowSd.getMonth(), this.sdate.getDate() + 1);
                while (sd < nowSd) {
                    sd.setMonth(sd.getMonth() + 1);
                }
                return new jDate(sd);
        }
    }
    /**
     * Gets the jdate of the last instance of a recurring event.
     */
    getPreviousInstance() {
        const nowSd = new Date(),
            nowJd = new jDate(nowSd);
        let jd, sd;
        switch (this.occasionType) {
            case UserOccasionTypes.HebrewDateRecurringYearly:
                jd = new jDate(nowJd.Year, this.jdate.Month, this.jdate.Day);
                while (jd.getDate() > nowSd) {
                    jd = jd.addYears(-1);
                }
                break;
            case UserOccasionTypes.HebrewDateRecurringMonthly:
                jd = new jDate(nowJd.Year, nowJd.Month, this.jdate.Day);
                while (jd.getDate() > nowSd) {
                    jd = jd.addMonths(-1);
                }
                break;
            case UserOccasionTypes.SecularDateRecurringYearly:
                sd = new Date(nowSd.getFullYear(), this.sdate.getMonth(), this.sdate.getDate() + 1);
                while (sd > nowSd) {
                    sd.setFullYear(sd.getFullYear() - 1);
                }
                jd = new jDate(sd);
                break;
            case UserOccasionTypes.SecularDateRecurringMonthly:
                sd = new Date(nowSd.getFullYear(), nowSd.getMonth(), this.sdate.getDate() + 1);
                while (sd > nowSd) {
                    sd.setMonth(sd.getMonth() - 1);
                }
                jd = new jDate(sd);
                break;
        }
        return jd;
    }
    /**
     * Compares 2 events to see if they have the same title, date, type, color and comment.
     * @param {UserOccasion} occasion
     */
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
    /**
     * Returns whether or not the color of this event was ever changed from the default color.
     */
    isCustomColor() {
        return this.color !== UserOccasion.defaultColor;
    }
    /**
     * Return a cloned copy of this event.S
     */
    clone() {
        return new UserOccasion(
            this.title,
            this.occasionType,
            this.dateAbs,
            this.color,
            this.comments,
            this.occasionId);
    }
    /**
     * Get the Jewish Date for the date of this event.
     */
    get jdate() {
        if (!this._jdate) {
            this._jdate = new jDate(this.dateAbs);
        }
        return this._jdate;
    }
    /**
     * Set the date of this event by supplying a Jewish Date.
     */
    set jdate(jd) {
        this._jdate = jd;
        this.dateAbs = jd.Abs;
        this._sdate = jd.getDate();
    }
    /**
     * Get the Secular Date for the date of this event.
     */
    get sdate() {
        if (!this._sdate) {
            this._sdate = jDate.sdFromAbs(this.dateAbs);
        }
        return this._sdate;
    }
    /**
     * Set the date of this event by supplying a Javascript Date.
     */
    set sdate(sd) {
        this._jdate = new jDate(sd);
        this._sdate = sd;
        this.dateAbs = this._jdate.Abs;
    }
    /**
     * Returns whether or not this Occasion was ever saved to the database.
     */
    get hasId() {
        return !!this.occasionId;
    }
    /**
     * Sorts a list of UserOccasions chronologically
     * @param {[UserOccasion]} occasionList
     */
    static sortList(occasionList) {
        return occasionList.sort((a, b) =>
            a.dateAbs - b.dateAbs);
    }
    /**
     * Returns a list of occasions for the given date.
     * Works out recurring occasions and returns those that the
     * given date matches any iteration.
     * @param {jDate} jdate
     * @param {[UserOccasion]} allOccasions
     */
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