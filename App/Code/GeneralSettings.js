import Location from './JCal/Location'

export default class GeneralSettings {
    constructor(location) {
        this.location = location || Location.getJerusalem();
    }
}