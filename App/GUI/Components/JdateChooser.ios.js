import React from 'react';
import { View, Text, TouchableOpacity, Modal, Button } from 'react-native';
import { Select, Option } from 'react-native-chooser';
import Utils from '../../Code/JCal/Utils';
import jDate from '../../Code/JCal/jDate';
import { range } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class OnahChooser extends React.Component {

    constructor(props) {
        super(props);
        const jdate = this.props.jdate;
        this.years = range(jdate.Year - 30, jdate.Year).reverse();
        this.daysOfMonth = range(1, 30);
        this.setDate = this.props.setDate;

        this.state = { modalVisible: false };

        this.changeDate = this.changeDate.bind(this);
    }
    changeDate(year, month, day) {
        //To prevent user from choosing a non-exiting month or day
        const daysInMonth = jDate.daysJMonth(year, month),
            monthsInYear = jDate.monthsJYear(year),
            jdate = new jDate(
                year,
                //Choosing Adar Sheini in a non-leap-year will set the month to Adar
                Math.min(month, monthsInYear),
                //Choosing day 30 in a non-full-month will set the day to 29
                Math.min(day, daysInMonth));

        this.setDate(jdate);
    }
    render() {
        const jdate = this.props.jdate;
        return <View>
            <TouchableOpacity onPress={() => this.setState({ modalVisible: true })}>
                <View style={GeneralStyles.textInput}>
                    <Text>{jdate.toString()}</Text>
                </View>
            </TouchableOpacity>
            <Modal
                style={{ flex: 1 }}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => this.setState({ modalVisible: false })}>
                <View style={{
                    margin: '10%',
                    backgroundColor: '#eef',
                    borderWidth: 1,
                    alignSelf: 'center',
                    flex: 0,
                    minWidth: '70%'
                }}>
                    <View style={{ flex: 1, backgroundColor: '#000a' }}>
                        <View style={{
                            margin: '10%',
                            backgroundColor: '#fff',
                            alignSelf: 'center',
                            flex: 0,
                            minWidth: '70%'
                        }}>
                            <View style={{
                                backgroundColor: '#99b',
                                paddingTop: 20,
                                paddingBottom: 20,
                                paddingLeft: 10
                            }}>
                                <Text style={{
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: 18
                                }}>{jdate.toString()}</Text>
                            </View>
                            <View>
                                <Text style={GeneralStyles.label}>Jewish Day</Text>
                                <Select
                                    onSelect={value => this.changeDate(jdate.Year, jdate.Month, value)}
                                    defaultText={jdate.Day.toString()}
                                    style={GeneralStyles.select}
                                    indicator='down'
                                    transparent={true}
                                    backdropStyle={GeneralStyles.optionListBackdrop}
                                    optionListStyle={GeneralStyles.optionListStyle}>
                                    {this.daysOfMonth.map(d =>
                                        <Option value={d} key={d}>{d.toString()}</Option>
                                    )}
                                </Select>
                            </View>
                            <View>
                                <Text style={GeneralStyles.label}>Jewish Month</Text>
                                <Select
                                    onSelect={value => this.changeDate(jdate.Year, value, jdate.Day)}
                                    defaultText={Utils.jMonthsEng[jdate.Month]}
                                    style={GeneralStyles.select}
                                    indicator='down'
                                    transparent={true}
                                    backdropStyle={GeneralStyles.optionListBackdrop}
                                    optionListStyle={GeneralStyles.optionListStyle}>
                                    {Utils.jMonthsEng.filter(m => m).map((m, i) =>
                                        <Option value={i + 1} key={i}>{m}</Option>
                                    )}
                                </Select>
                            </View>
                            <View>
                                <Text style={GeneralStyles.label}>Jewish Year</Text>
                                <Select
                                    onSelect={value => this.changeDate(value, jdate.Month, jdate.Day)}
                                    defaultText={jdate.Year.toString()}
                                    style={GeneralStyles.select}
                                    indicator='down'
                                    transparent={true}
                                    backdropStyle={GeneralStyles.optionListBackdrop}
                                    optionListStyle={GeneralStyles.optionListStyle}>
                                    {this.years.map(d =>
                                        <Option value={d} key={d}>{d.toString()}</Option>
                                    )}
                                </Select>
                            </View>
                            <View style={{
                                alignItems: 'center',
                                marginBottom: 10
                            }}>
                                <Button onPress={() =>
                                    this.setState({ modalVisible: false })} title='Close' />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>;
    }
}