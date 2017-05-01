import { StyleSheet } from 'react-native';

const GeneralStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexWrap: 'wrap',
        backgroundColor: '#fff'
    },
    header: {
        backgroundColor: '#fe9',
        color: '#977',
        padding: 5,
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14
    },
    formRow: { flex: 1, flexDirection: 'column' },
    label: { margin: 0, backgroundColor: '#f5f5e8', padding: 10 },
    picker: { margin: 0 },
    switch: { margin: 5, alignSelf: 'flex-start' },
    textInput: { margin: 5, alignSelf: 'flex-start' },
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
    btn: { fontSize: 7, height: 25 },
    emptyListView: {
        alignItems: 'center',
        flex: 1,
        marginTop: 50
    },
    emptyListText: { fontSize: 20,
        fontWeight: 'bold',
        color: '#a8d',
        marginBottom: 35,
        textAlign:'center' },
    emptyListImage:{
        width:150,
        height:150}
});

export { GeneralStyles };