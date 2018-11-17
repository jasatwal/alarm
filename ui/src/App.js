import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
//import './App.css';
import SocketContext from './common/SocketContext';



import CssBaseline from '@material-ui/core/CssBaseline';


import AppBar from './common/AppBar';
import Alarm from './components/Alarm';
import SensorList from './components/SensorList';
import NotificationTab from './components/NotificationTab'


//import SubscriptionButton from './SubscriptionButton';
//import SensorList from './SensorList';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <CssBaseline />
          <AppBar />
          <Switch>
            <Route exact path="/" component={Alarm} />
            <Route path="/sensors" component={SensorList} />
            <Route path="/notifications" component={NotificationTab} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
