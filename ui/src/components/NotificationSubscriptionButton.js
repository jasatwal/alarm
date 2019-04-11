import React, { Component } from 'react';

// https://github.com/GoogleChromeLabs/web-push-codelab/blob/master/completed/08-push-subscription-change/sw.js
// https://developers.google.com/web/fundamentals/push-notifications/sending-messages-with-web-push-libraries

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default class SubscriptionButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.evaluateSubscription()
  }

  async evaluateSubscription() {
    let subscribed = false;
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      subscribed = !!subscription;
    }// else {
      // No service worker registered so not possible to have a subscription
    //}

    this.setState({ subscribed });
  }

  onClick(event) {
    if (this.state.subscribed) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }

  async subscribe() {
    const registration = await this.registerServiceWorker();
    if (registration) {
      const permission = await Notification.requestPermission();
      console.log('permission', permission);
      
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BPh8fk5CtJ_oATMSk18R7_qUPmlGC6-geArdWfWeW6JNQXpj5MT3shy0j1GGt2V5hK_YliR2ZP9pVDxDttnQFi0'
        )
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      await this.saveSubscription(subscription);
      this.setState({ subscribed: true });
    }
  }

  async registerServiceWorker() {
    try {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;
      const registration = await navigator.serviceWorker.register(swUrl);

      console.log('Service worker successfully registered.', registration);

      await navigator.serviceWorker.ready;

      console.log('Service worker ready.');
      return registration;
    } catch (e) {
      console.error('Unable to register service worker.', e);
    }
  }

  async saveSubscription(subscription) {
    return window.fetch('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers:{
        'Content-Type': 'application/json'
      }                
    });
  }

  async unsubscribe() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    const success = await subscription.unsubscribe();
    if (success) {
      this.setState({ subscribed: false });
    } else {
      console.error('Could not unsubscribe.');
    }
  }

  getButtonText() {
    if (this.state.subscribed === undefined) {
      return 'Please wait...';
    } else if (this.state.subscribed) {
      return 'Unsubscribe'
    } else {
      return 'Subscribe';
    }
  }

  render() {
    return (
      <button onClick={this.onClick.bind(this)}>{this.getButtonText()}</button>
    )
  }
}