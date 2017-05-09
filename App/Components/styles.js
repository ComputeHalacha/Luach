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
        backgroundColor: '#d5d5e6',
        padding: 10
    },
    picker: { margin: 0 },
    switch: {
        margin: 5,
        alignSelf: 'flex-start'
    },
    textInput: {
        margin: 5,
        alignSelf: 'flex-start',
        width: '95%'
    },
    buttonList: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    inItemButtonList: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    inItemLinkText: {
        fontSize: 10,
        fontStyle: 'italic'
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
    emptyListView: {
        alignItems: 'center',
        flex: 1,
        marginTop: 50
    },
    emptyListText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#99b',
        marginBottom: 35,
        textAlign: 'center'
    },
    emptyListImage: {
        width: 150,
        height: 150
    },
});

export { GeneralStyles };