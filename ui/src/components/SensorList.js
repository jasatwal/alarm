import React, { Component } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

import SocketContext from '../common/SocketContext';
import SensorIcon from './SensorState';

export default class SensorList extends Component {
  constructor(props) {
    super(props)
    this.state = { sensors: [] };
  }

  async componentDidMount() {
    const response = await fetch('/api/sensors');
    const { collection } = await response.json();
    this.setState({ sensors: collection.items });
  }

  render() {
    return (
      <List>
        {this.state.sensors.map(sensor => 
          <ListItem key={sensor.data[0].value}>
            <ListItemAvatar>
              <Avatar>
                <SocketContext.Consumer>
                  {socket => <SensorIcon sensorId={sensor.data[0].value} socket={socket} />}
                </SocketContext.Consumer>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={sensor.data[1].value} />
            <ListItemSecondaryAction>
              <IconButton aria-label="Edit">
                <EditIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        )}
      </List>
    );
  }
}