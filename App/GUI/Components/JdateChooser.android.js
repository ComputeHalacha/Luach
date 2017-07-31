import React from 'react';
import { View, Text, Picker, Modal, TouchableOpacity } from 'react-native';
import Utils from '../../Code/JCal/Utils';
import jDate from '../../Code/JCal/jDate';
import { range } from '../../Code/GeneralUtils';
import { GeneralStyles } from '../styles';

export default class OnahChooser extends React.Component {
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
                style={{flex:1}}
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
                    <View>
                        <Text style={GeneralStyles.label}>Jewish Month</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={jdate.Day}
                            onValueChange={value => this.changeDate(jdate.Year, jdate.Month, value)}>
                            {this.days.map(d =>
                                <Picker.Item label={d.toString()} value={d} key={d} />
                            )}
                        </Picker>
                    </View>
                    <View>
                        <Text style={GeneralStyles.label}>Jewish Month</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={jdate.Month}
                            onValueChange={value => this.changeDate(jdate.Year, value, jdate.Day)}>
                            {this.months.map(i =>
                                <Picker.Item label={Utils.jMonthsEng[i]} value={i} key={i} />
                            )}
                        </Picker>
                    </View>
                    <View>
                        <Text style={GeneralStyles.label}>Jewish Year</Text>
                        <Picker style={GeneralStyles.picker}
                            selectedValue={jdate.Year}
                            onValueChange={value => this.changeDate(value, jdate.Month, jdate.Day)}>
                            {this.years.map(d =>
                                <Picker.Item label={d.toString()} value={d} key={d} />
                            )}
                        </Picker>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() =>
                            this.setState({ modalVisible: false })}>
                            <View style={{ alignItems: 'flex-end', margin: 10 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#599' }}>CLOSE</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>;
    }
}
