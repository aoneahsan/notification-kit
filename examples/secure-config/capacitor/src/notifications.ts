/**
 * Secure notification setup for Capacitor apps
 * Works with React, Vue, Angular, or vanilla JS
 */

import { NotificationKit } from 'notification-kit';
import { Capacitor } from '@capacitor/core';

/**
 * Configuration loader that works for both web and native
 */
async function loadConfig() {
  // For web builds, use environment variables
  if (!Capacitor.isNativePlatform()) {
    return {
      provider: import.meta.env.VITE_NOTIFICATION_PROVIDER as 'firebase' | 'onesignal',
      firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      },
      onesignal: {
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      },
    };
  }

  // For native builds, you might want to:
  // 1. Fetch config from a secure endpoint
  // 2. Use secure storage to cache config
  // 3. Use platform-specific secure config

  // Example: Fetch from secure endpoint
  try {
    const response = await fetch('https://api.example.com/notification-config', {
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to load notification config:', error);
    throw error;
  }
}

/**
 * Initialize notifications securely
 */
export async function initializeNotifications() {
  try {
    const config = await loadConfig();
    
    if (config.provider === 'firebase') {
      await NotificationKit.init({
        provider: 'firebase',
        config: config.firebase,
      });
    } else if (config.provider === 'onesignal') {
      await NotificationKit.init({
        provider: 'onesignal',
        config: config.onesignal,
      });
    }

    console.log('Notifications initialized for platform:', Capacitor.getPlatform());
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    // Handle error appropriately
  }
}

/**
 * Get auth token for secure config endpoint
 * Implement based on your auth system
 */
async function getAuthToken(): Promise<string> {
  // This is just an example - implement your actual auth
  // Could use:
  // - Firebase Auth
  // - Auth0
  // - Custom JWT
  // - etc.
  return 'your-auth-token';
}