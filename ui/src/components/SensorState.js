import React, { Component } from 'react';
import SentimentSatisfiedIcon from '@material-ui/icons/SentimentSatisfied';
import SentimentDissatisfiedIcon from '@material-ui/icons/SentimentDissatisfied';

export default class SensorState extends Component {
  constructor(props) {
    super(props);
    this.state = { on: false };
  }

  componentDidMount() {
    const { socket } = this.props;
    socket.on('sensorStateChange', this.handleSensorStateChange);
  }

  componentWillUnmount() {
    const { socket } = this.props;
    socket.removeListener('sensorStateChange', this.handleSensorStateChange);
  }

  handleSensorStateChange = (sensor) => {
    const { sensorId } = this.props;
    if (sensor.id == sensorId) {
      this.setState({ on: sensor.state !== 'off' });
    }    
  }

  render() {
    const Icon = this.state.on ? SentimentDissatisfiedIcon : SentimentSatisfiedIcon;
    return (
      <Icon />
    );
  }
}