import { StyleSheet } from 'react-native';

const GeneralStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexWrap: 'wrap',
        backgroundColor: '#fff'
    },
    header: {
        backgroundColor: '#fe9', color: '#977', padding: 5, flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 14
    },
    formRow: { flex: 1, flexDirection: 'column' },
    label: { margin: 0, backgroundColor: '#f5f5e8', padding: 10 },
    picker: { margin: 0 },
    switch: { margin: 5, alignSelf: 'flex-start' },
    textInput: { margin: 5, alignSelf: 'flex-start' },
    buttonList: { flexDirection: 'row', justifyContent: 'space-around' },
    dateEng: { color: '#080' },
    dateHeb: { color: '#008' },
    btn: { fontSize: 7, height: 25 }
});

export { GeneralStyles };