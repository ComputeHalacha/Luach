import DataUtils from './DataUtils';
import Settings from '../Settings';
import Kavuah from '../Chashavshavon/Kavuah';
import EntryList from '../Chashavshavon/EntryList';

if (!global.AppData) {
    global.AppData = new AppData();
}

export default class AppData {
    constructor() {
        this.Settings = await Settings.fromDatabase();
        this.EntryList = await EntryList.fromDatabase(this.Settings);
        this.KavuahList = await Kavuah.getAll(this.EntryList);
        this.ProblemEntries = this.EntryList.getProblemOnahs(this.KavuahList);
    }
    static Settings() {
        return global.AppData.Settings;
    }
    static EntryList() {
        return global.AppData.EntryList;
    }
    static KavuahList() {
        return global.AppData.KavuahList;
    }
    static ProblemEntries() {
        return global.AppData.ProblemEntries;
    }
}