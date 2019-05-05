import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

export default class Alarm extends Component {
  constructor(props) {
    super(props);
    this.state = { text: 'Loading...', alarmState: 'Unknown' };
  }

  async componentDidMount() {
    const response = await fetch('/api');
    const json = await response.json();
    const alarmState = json.collection.items[0].data[0].value;
    const operation = json.collection.operations[0];
    this.setup(operation, alarmState);
  }

  setup(operation, alarmState) {
    this.operation = operation;
    const text = operation.prompt || `${operation.rel[0]}${operation.rel.substring(1)}`;
    this.setState({ text, alarmState });
  }

  async handleClick() {
    const { method, data } = this.operation;
    const response = await fetch('/api', {
      method: method,
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();
    const alarmState = json.collection.items[0].data[0].value;
    const operation = json.collection.operations[0];
    this.setup(operation, alarmState);
  }

  render() {
    return (
      <div>
        <div>
          <AlarmButton text={this.state.text} onClick={this.handleClick.bind(this)} />
        </div>
        <div>
          CurrentState: {this.state.alarmState}
        </div>
      </div>
    )
  }
}

const alarmButtonStyles = {
  root: {

  },
};

const AlarmButton = withStyles(alarmButtonStyles)((props) => {
  const { classes, className, ...other } = props;
  return (
    <Button variant="contained" className={classNames(classes.root, className)} {...other} >{props.text || ''}</Button>
  );
});
  