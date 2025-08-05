/**
 * Firebase Messaging Service Worker Template
 * 
 * IMPORTANT: This is a template file. DO NOT hardcode your Firebase configuration here.
 * The actual configuration will be injected at runtime by notification-kit.
 * 
 * Usage:
 * 1. Copy this file to your public directory as firebase-messaging-sw.js
 * 2. notification-kit will inject the configuration at runtime
 * 3. Never commit Firebase credentials to this file
 */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuration will be injected at runtime
let firebaseConfig = null;

// Listen for configuration from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    // Receive configuration securely at runtime
    firebaseConfig = event.data.config;
    
    // Initialize Firebase with the provided configuration
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    
    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message', {
        // Log message receipt without exposing sensitive data
        hasTitle: !!payload.notification?.title,
        hasBody: !!payload.notification?.body,
      });
      
      const notificationTitle = payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/icon-192x192.png',
        badge: payload.notification?.badge || '/badge-72x72.png',
        image: payload.notification?.image,
        data: payload.data,
        ...(payload.fcmOptions?.link && { data: { ...payload.data, link: payload.fcmOptions.link } })
      };
      
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
    
    // Confirm configuration was received
    if (event.ports?.[0]) {
      event.ports[0].postMessage({ success: true });
    }
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received');
  
  event.notification.close();
  
  // Handle link navigation if provided
  const link = event.notification.data?.link || event.notification.data?.fcm_options?.link || '/';
  
  event.waitUntil(
    clients.openWindow(link)
  );
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting();
});