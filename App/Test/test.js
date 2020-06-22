import {Onah, NightDay} from '../Code/Chashavshavon/Onah';
import {Kavuah, KavuahTypes} from '../Code/Chashavshavon/Kavuah';
import {ProblemOnah} from '../Code/Chashavshavon/ProblemOnah';
import Entry from '../Code/Chashavshavon/Entry';
import EntryList from '../Code/Chashavshavon/EntryList';
import FlaggedDatesGenerator from '../Code/Chashavshavon/FlaggedDatesGenerator';
import jDate from '../Code/JCal/jDate';
import Location from '../Code/JCal/Location';
import Settings from '../Code/Settings';

export function testFlaggedDates() {
    const settings = new Settings({
        location: Location.getLakewood(),
        showOhrZeruah: true,
        keepThirtyOne: true,
        fourDaysHefsek: false,
        onahBeinunis24Hours: true,
        numberMonthsAheadToWarn: 12,
        keepLongerHaflagah: true,
        dilugChodeshPastEnds: false,
        haflagaOfOnahs: false,
        kavuahDiffOnahs: false,
        noProbsAfterEntry: false,
    }),
        entryList = new EntryList(settings, [
            new Entry(new Onah(new jDate(5777, 7, 1), NightDay.Day)),
            new Entry(new Onah(new jDate(5777, 8, 1), NightDay.Day)),
        ]);
    entryList.calculateHaflagas();

    const entries = entryList.realEntrysList,
        kavuahs = [
            new Kavuah(
                KavuahTypes.DayOfMonth,
                entries[0],
                1,
                false,
                true,
                false
            ),
        ],
        correctProbs = [
            new ProblemOnah(new jDate(5777, 7, 30), NightDay.Night, [
                'Thirtieth Day (24 hour)',
            ]),
            new ProblemOnah(new jDate(5777, 7, 30), NightDay.Day, [
                'Thirtieth Day',
            ]),
            new ProblemOnah(new jDate(5777, 8, 1), NightDay.Night, [
                'Thirty First Day (24 hour)',
                'Yom Hachodesh (24 hour)',
                'Ohr Zarua of the Kavuah for Day-time on every 1st day of the Jewish Month',
            ]),
            new ProblemOnah(new jDate(5777, 8, 1), NightDay.Day, [
                'Thirty First Day',
                'Yom Hachodesh',
                'Kavuah for Day-time on every 1st day of the Jewish Month',
            ]),
        ],
        foundProbs = new FlaggedDatesGenerator(
            entries,
            kavuahs,
            settings
        ).getProblemOnahs();

    for (let prob of foundProbs) {
        if (!correctProbs.some(p => p.isSameProb(prob))) {
            return false;
        }
    }
    for (let prob of correctProbs) {
        if (!foundProbs.some(p => p.isSameProb(prob))) {
            return false;
        }
    }
    return true;
}
