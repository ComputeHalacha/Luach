import { StyleSheet } from 'react-native';

const GeneralStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        backgroundColor: '#99e',
        color: '#eef',
        padding: 5,
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14
    },
    formRow: {
        flex: 1,
        flexDirection: 'column'
    },
    label: {
        margin: 0,
        backgroundColor: '#e8e8f5',
        padding: 10
    },
    picker: { margin: 0 },
    switch: {
        margin: 5,
        alignSelf: 'flex-start'
    },
    textInput: {
        margin: 5,
        alignSelf: 'flex-start'
    },
    buttonList: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerButtons: {
        backgroundColor: '#eef',
        borderBottomWidth: 1,
        borderBottomColor: '#99b'
    },
    dateEng: { color: '#080' },
    dateHeb: { color: '#008' },
    btn: {
        fontSize: 7,
        height: 25
    },
});

export { GeneralStyles };