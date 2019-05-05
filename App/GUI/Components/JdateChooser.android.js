import React from 'react';
import { View, Text, Picker, Modal, TouchableOpacity } from 'react-native';
import Utils from '../../Code/JCal/Utils';
import jDate from '../../Code/JCal/jDate';
import { range } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class OnahChooser extends React.PureComponent {
    constructor(props) {
        super(props);
        const jdate = this.props.jdate;
        this.setDate = this.props.setDate;
        this.days = range(1, 30);
        this.months = range(1, 13);
        this.years = range(jdate.Year - 30, jdate.Year).reverse();

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
                Math.min(day, daysInMonth)
            );

        this.setDate(jdate);
    }
    render() {
        const jdate = this.props.jdate;
        return (
            <View>
                <TouchableOpacity
                    onPress={() => this.setState({ modalVisible: true })}>
                    <View style={GeneralStyles.textInput}>
                        <Text>{jdate.toString()}</Text>
                    </View>
                </TouchableOpacity>
                <Modal
                    style={{ flex: 1 }}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() =>
                        this.setState({ modalVisible: false })
                    }>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#0009',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                backgroundColor: '#fff',
                                flex: 0,
                                width: 350,
                                maxWidth: '90%',
                            }}>
                            <View
                                style={{
                                    backgroundColor: '#88a',
                                    paddingTop: 30,
                                    paddingBottom: 30,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                }}>
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: 18,
                                        textAlign: 'center',
                                    }}>
                                    {jdate.toString() + '\n'}
                                    <Text style={{ fontSize: 22 }}>
                                        {jdate.toStringHeb()}
                                    </Text>
                                </Text>
                            </View>
                            <View>
                                <Text style={GeneralStyles.label}>
                                    Jewish Day
                                </Text>
                                <Picker
                                    style={GeneralStyles.picker}
                                    selectedValue={jdate.Day}
                                    onValueChange={value =>
                                        this.changeDate(
                                            jdate.Year,
                                            jdate.Month,
                                            value
                                        )
                                    }>
                                    {this.days.map(d => (
                                        <Picker.Item
                                            label={d.toString()}
                                            value={d}
                                            key={d}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            <View>
                                <Text style={GeneralStyles.label}>
                                    Jewish Month
                                </Text>
                                <Picker
                                    style={GeneralStyles.picker}
                                    selectedValue={jdate.Month}
                                    onValueChange={value =>
                                        this.changeDate(
                                            jdate.Year,
                                            value,
                                            jdate.Day
                                        )
                                    }>
                                    {this.months.map(i => (
                                        <Picker.Item
                                            label={Utils.jMonthsEng[i]}
                                            value={i}
                                            key={i}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            <View>
                                <Text style={GeneralStyles.label}>
                                    Jewish Year
                                </Text>
                                <Picker
                                    style={GeneralStyles.picker}
                                    selectedValue={jdate.Year}
                                    onValueChange={value =>
                                        this.changeDate(
                                            value,
                                            jdate.Month,
                                            jdate.Day
                                        )
                                    }>
                                    {this.years.map(d => (
                                        <Picker.Item
                                            label={d.toString()}
                                            value={d}
                                            key={d}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            <View>
                                <TouchableOpacity
                                    onPress={() =>
                                        this.setState({ modalVisible: false })
                                    }>
                                    <View
                                        style={{
                                            alignItems: 'flex-end',
                                            margin: 30,
                                        }}>
                                        <Text
                                            style={{
                                                fontWeight: 'bold',
                                                fontSize: 15,
                                                color: '#77a',
                                            }}>
                                            CLOSE
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}
