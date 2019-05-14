import { StyleSheet } from 'react-native';

const GeneralStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        alignItems: 'center',
    },
    centeredRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerView: {
        backgroundColor: '#99e',
        padding: 5,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        color: '#eef',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
    },
    formRow: {
        flex: 1,
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#99a',
        margin: 2,
        borderRadius: 2,
    },
    label: {
        margin: 0,
        backgroundColor: '#d5d5e6',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#99a',
    },
    picker: { margin: 0 },
    select: {
        margin: 0,
        width: '100%',
        borderWidth: 0,
    },
    optionListBackdrop: { backgroundColor: '#d5d5e6' },
    optionListStyle: {
        backgroundColor: '#fff',
        height: '80%',
        width: '80%',
        borderRadius: 6,
    },
    switch: {
        margin: 5,
        alignSelf: 'flex-start',
    },
    textInput: {
        margin: 5,
        alignSelf: 'flex-start',
        width: '95%',
        height: 40,
        borderWidth: 1,
        borderColor: '#cce',
        borderRadius: 5,
        padding: 3,
        justifyContent: 'center',
    },
    timeInput: {
        margin: 3,
        alignSelf: 'flex-start',
        height: 30,
        borderWidth: 1,
        borderColor: '#99a',
        borderRadius: 5,
        padding: 3,
        justifyContent: 'center',
        backgroundColor: '#dde',
    },
    buttonList: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    inItemButtonList: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 5,
    },
    inItemLinkText: {
        fontSize: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    inItemLinkIcon: {
        height: 20,
    },
    headerButtons: {
        backgroundColor: '#eef',
        borderBottomWidth: 1,
        borderBottomColor: '#99b',
        padding: 5,
    },
    dateEng: { color: '#080' },
    dateHeb: { color: '#008' },
    btn: {
        fontSize: 7,
        height: 25,
    },
    btnAddNew: {
        flex: 0,
        alignSelf: 'center',
        width: 200,
        marginTop: 25,
        marginBottom: 25,
    },
    emptyListView: {
        alignItems: 'center',
        flex: 1,
        marginTop: 50,
    },
    emptyListText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#99b',
        marginBottom: 35,
        textAlign: 'center',
    },
    emptyListImage: {
        width: 150,
        height: 150,
    },
    divider: { backgroundColor: '#777', margin: 10 },
});

export { GeneralStyles };
