/**
 * Check out https://googlechromelabs.github.io/sw-toolbox/ for
 * more info on how to use sw-toolbox to custom configure your service worker.
 */

'use strict';
importScripts('./build/sw-toolbox.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyA9RMaRNiybHZvMLsQcGB0aFR8bE7TYdcI",
  authDomain: "tug-project-39442.firebaseapp.com",
  databaseURL: "https://tug-project-39442.firebaseio.com",
  projectId: "tug-project-39442",
  storageBucket: "tug-project-39442.appspot.com",
  messagingSenderId: "487644774277"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // let user = firebase.auth().currentUser;
  // console.log("user.uid: ", user.uid);
  const notificationTitle = payload.data.title; 
  const notificationOptions = { 
    body: payload.data.body,
    data: payload.data.data,
    icon: payload.data.icon,
    click_action: payload.data.click_action 
  }; 
  return self.registration.showNotification(payload.data.title,
  notificationOptions);
});


self.addEventListener('notificationclick', function (event) { 
  console.log('TITLE' + event.notification.title); 
  let notification = { 
    'title': event.notification.title, 
    'body': event.notification.body, 
    'data': event.notification.data,
    'clicked': 'true' 
  }
  console.log("payload: ", event.notification); 
  // fetch('http://localhost:3000/api-server', { 
  //   'method': 'POST', 'headers': { 
  //     'Content-Type': 'application/json', 
  //   }, 
  //   'body': JSON.stringify({ notification }) 
  // }) 
  event.notification.close(); 
  event.waitUntil(self.clients.openWindow('http://localhost:8100')); 
})

self.toolbox.options.cache = {
  name: 'ionic-cache'
};

// pre-cache our key assets
self.toolbox.precache(
  [
    './build/main.js',
    './build/vendor.js',
    './build/main.css',
    './build/polyfills.js',
    'index.html',
    'manifest.json'
  ]
);

// dynamically cache any other local assets
self.toolbox.router.any('/*', self.toolbox.fastest);

// for any other requests go to the network, cache,
// and then only use that cached resource if your user goes offline
self.toolbox.router.default = self.toolbox.networkFirst;
