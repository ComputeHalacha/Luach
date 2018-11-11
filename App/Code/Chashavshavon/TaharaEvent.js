const TaharaEventType = Object.freeze({
    Hefsek: 1,
    Bedika: 2,
    Shailah: 4,
    Mikvah: 8
});

class TaharaEvent {
    constructor(jdate, taharaEventType, taharaEventId) {
        this.jdate = jdate;
        this.taharaEventType = taharaEventType;
        this.taharaEventId = taharaEventId;
    }
    /**
     * Gets the string representation of this TaharaEvent's type
     */
    toTypeString() {
        return TaharaEvent.toTaharaEventTypeString(this.taharaEventType);
    }
    get hasId() {
        return !!this.taharaEventId;
    }
    /**
     * Sorts a list of TaharaEvents chronologically
     * @param {[TaharaEvent]} taharaEventsList
     */
    static sortList(taharaEventsList) {
        return taharaEventsList.sort((a, b) =>
            a.jdate.Abs - b.jdate.Abs);
    }
    /**
     * Gets the string representation of a TaharaEventType
     * @param {TaharaEventType} taharaEventType
     */
    static toTaharaEventTypeString(taharaEventType) {
        switch (taharaEventType) {
            case TaharaEventType.Hefsek:
                return 'Hefsek Tahara';
            case TaharaEventType.Bedika:
                return 'Bedika';
            case TaharaEventType.Shailah:
                return 'Shailah';
            case TaharaEventType.Mikvah:
                return 'Mikvah';
        }
    }
}

export { TaharaEventType, TaharaEvent };