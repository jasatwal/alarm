import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

export default class Alarm extends Component {
  constructor(props) {
    super(props);
    this.state = { text: 'Loading...' };
  }

  async componentDidMount() {
    const response = await fetch('/api');
    const data = await response.json();
    const operation = data.collection.operations[0];
    this.setup(operation);
  }

  setup(operation) {
    this.operation = operation;
    const text = operation.prompt || `${operation.rel[0]}${operation.rel.substring(1)}`;
    this.setState({ text });
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
    const operation = json.collection.operations[0];
    this.setup(operation);
  }

  render() {
    return (
      <div>
        <AlarmButton text={this.state.text} onClick={this.handleClick.bind(this)} />
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
  