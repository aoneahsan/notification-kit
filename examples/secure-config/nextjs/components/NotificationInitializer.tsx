/**
 * Client Component for Secure Notification Initialization
 */

'use client';

import { useEffect } from 'react';
import { initializeNotifications } from '../lib/notification-config';
import { notifications } from 'notification-kit';

export function NotificationInitializer() {
  useEffect(() => {
    // Initialize notifications on mount
    initializeNotifications().then(() => {
      // Set up notification handlers
      notifications.onPush((payload) => {
        console.log('Push notification received:', {
          hasTitle: !!payload.notification?.title,
          hasBody: !!payload.notification?.body,
          // Don't log sensitive data
        });
      });

      notifications.onPushOpened((payload) => {
        console.log('Push notification opened');
        // Handle notification tap
      });

      // Request permission if needed
      notifications.isPermissionGranted().then((granted) => {
        if (!granted) {
          // You might want to show a custom UI before requesting
          console.log('Push notifications not yet granted');
        }
      });
    });

    // Cleanup
    return () => {
      // notification-kit handles its own cleanup
    };
  }, []);

  return null; // This component doesn't render anything
}