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
    toKnownDateString() {
        switch (this.taharaEventType) {
            case TaharaEventType.Hefsek:
                return 'Hefsek';
            case TaharaEventType.Bedika:
                return 'Bedika';
            case TaharaEventType.Shailah:
                return 'Shailah';
            case TaharaEventType.Mikvah:
                return 'Mikvah';
        }
    }
    get hasId() {
        return !!this.taharaEventId;
    }
}

export { TaharaEventType, TaharaEvent };