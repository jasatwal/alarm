import React, { Component } from 'react';
import { withRouter, Link } from "react-router-dom";

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const styles = {
  root: {
    flexGrow: 1
  },
};

function getSelectedTabIndex(pathname) {
  switch (pathname.toLowerCase()) {
    case '/sensors': return 1;
    case '/logs': return 2;
    case '/notifications': return 3;
    default: return 0;
  }
}

class MainAppBar extends Component {
  constructor(props) {  
    super(props);
    this.state = {
      value: getSelectedTabIndex(props.location.pathname)
    };
  }

  handleChange = (_, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="title" color="inherit">
            Home Security
          </Typography>
        </Toolbar>
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          indicatorColor="secondary"
          textColor="secondary"
          centered>
          <Tab label="Alarm" component={Link} to="/" />
          <Tab label="Sensors" component={Link} to="/sensors" />
          <Tab label="Logs" component={Link} to="/logs" />
          <Tab label="Notifications" component={Link} to="/notifications" />
        </Tabs>        
      </AppBar>
    );
  }

  static propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };
}

export default withRouter(withStyles(styles)(MainAppBar));