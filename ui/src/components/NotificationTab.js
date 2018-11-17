import React, { Component } from 'react';

import NotificationSubscriptionButton from './NotificationSubscriptionButton';
import NotificationList from './NotificationList';

export default class NotificationsTab extends Component {
  render() {
    return (
      <div>
        <NotificationSubscriptionButton />
        <NotificationList />
      </div>
    )
  }
}