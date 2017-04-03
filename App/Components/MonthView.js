import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Grid, Col, Row } from 'react-native-elements/src';

export default class MonthView extends Component {
    render() {
        return (
            <Grid>
                <Col>
                    <Row>
                        <Text>1</Text>
                    </Row>
                    <Row>
                        <Text>2</Text>
                    </Row>
                    <Row><Text>3</Text></Row>
                    <Row><Text>4</Text></Row>
                </Col>
                <Col>
                    <Row>
                        <Text>10</Text>
                    </Row>
                    <Row>
                        <Text>20</Text>
                    </Row>
                    <Row><Text>30</Text></Row>
                    <Row><Text>40</Text></Row>
                </Col>
                <Col>
                    <Row>
                        <Text>100</Text>
                    </Row>
                    <Row>
                        <Text>200</Text>
                    </Row>
                    <Row><Text>300</Text></Row>
                    <Row><Text>400</Text></Row>
                </Col>
            </Grid>
        );
    }
}

const styles = StyleSheet.create({

});
