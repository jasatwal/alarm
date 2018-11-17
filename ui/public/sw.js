// chrome://serviceworker-internals/
import idb from 'idb';

self.addEventListener('install', function(event) {
  console.log('my install', event);
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');

  const notification = event.data.json();
  const title = 'Push Codelab';
  const options = {
    body: notification.text,
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };



  event.waitUntil(self.registration.showNotification(title, options));

  // TODO: v2 - Store in local DB
});