# notification-kit

A unified notification library for React + Capacitor apps. One API for push notifications, in-app notifications, and local notifications across Web, iOS, and Android.

## 📚 Documentation

- [**Full Documentation**](https://github.com/aoneahsan/notification-kit/wiki) - Comprehensive guides and API reference
- [**API Reference**](https://github.com/aoneahsan/notification-kit/wiki/api-reference) - Complete API documentation
- [**Quick Start Guide**](https://github.com/aoneahsan/notification-kit/wiki/quick-start) - Get up and running in minutes
- [**Examples**](https://github.com/aoneahsan/notification-kit/tree/main/examples) - Sample implementations
- [**Migration Guide**](https://github.com/aoneahsan/notification-kit/wiki/migration) - Upgrade from previous versions
- [**Troubleshooting**](https://github.com/aoneahsan/notification-kit/wiki/troubleshooting) - Common issues and solutions

## ✨ Features

### Core Capabilities
- 🔔 **Push Notifications** - Firebase & OneSignal support with automatic token management
- 💬 **In-App Notifications** - Beautiful toast-style notifications with customizable themes
- ⏰ **Local Notifications** - Advanced scheduling with recurring patterns and actions
- 📱 **Cross-Platform** - Unified API for Web, iOS, and Android platforms
- 🔧 **Full TypeScript Support** - Complete type safety and IntelliSense
- 🎯 **Zero Configuration** - No providers or wrappers needed, works out of the box
- 🎨 **Customizable** - Extensive theming and styling options
- 🔐 **Permission Management** - Built-in permission handling across platforms
- 📊 **Notification Channels** - Android channel support for notification categories
- 🎬 **Rich Media** - Support for images, progress bars, and action buttons
- 🔄 **Topic Subscriptions** - Easy topic-based notification targeting
- 🎯 **Event Handling** - Comprehensive event system for all notification lifecycle events
- 💾 **Offline Support** - Queue notifications when offline
- 🌐 **i18n Ready** - Full internationalization support
- ♿ **Accessible** - WCAG 2.1 compliant notifications
- 🚀 **Performance Optimized** - Lightweight with tree-shaking support
- 🔒 **Secure** - No sensitive data logging, secure token handling
- 📦 **Modular** - Import only what you need
- 🧪 **Well Tested** - Comprehensive test coverage
- 📖 **Extensively Documented** - Detailed docs with examples

## Installation

```bash
npm install notification-kit
npm install @capacitor/push-notifications @capacitor/local-notifications
npx cap sync
```

## Quick Start

### 1. Initialize (Once in your app)

```tsx
// App.tsx or index.tsx
import { NotificationKit } from 'notification-kit';

// Initialize with Firebase
NotificationKit.init({
	provider: 'firebase',
	config: {
		apiKey: '...',
		authDomain: '...',
		projectId: '...',
		storageBucket: '...',
		messagingSenderId: '...',
		appId: '...',
		vapidKey: '...', // for web push
	},
});

// OR Initialize with OneSignal
NotificationKit.init({
	provider: 'onesignal',
	config: {
		appId: 'your-onesignal-app-id',
	},
});
```

### 2. Use Anywhere - No Providers Needed!

```tsx
import { notifications } from 'notification-kit';

// Request permissions
await notifications.requestPermission();

// Schedule a notification
await notifications.schedule({
	title: 'Reminder',
	body: 'Meeting in 5 minutes',
	in: { minutes: 5 },
});

// Show in-app notification
notifications.showInApp({
	title: 'Success!',
	message: 'Your changes have been saved',
	type: 'success',
});
```

### 3. React Hooks (Also No Provider!)

```tsx
import { useNotifications, useInAppNotification } from 'notification-kit/react';

function MyComponent() {
	const { isPermissionGranted, requestPermission } = useNotifications();
	const notify = useInAppNotification();

	const handleSave = async () => {
		await saveData();
		notify.success('Saved successfully!');
	};

	return <button onClick={handleSave}>Save</button>;
}
```

## Core Features

### Push Notifications

```tsx
import { notifications } from 'notification-kit';

// Get device token
const token = await notifications.getToken();

// Subscribe to topics
await notifications.subscribe('news');
await notifications.subscribe('sports');

// Listen for push notifications
notifications.onPush((notification) => {
	console.log('Push received:', notification);
});

// Handle notification tap
notifications.onPushOpened((notification) => {
	// Navigate to relevant screen
	if (notification.data?.screen) {
		router.push(notification.data.screen);
	}
});
```

### Local Notifications

```tsx
import { notifications } from 'notification-kit';

// Simple notification in 5 minutes
await notifications.schedule({
  title: 'Reminder',
  body: 'Don\'t forget your meeting!',
  in: { minutes: 5 }
});

// Schedule at specific time
await notifications.schedule({
  title: 'Daily Standup',
  body: 'Team meeting starting',
  at: new Date('2024-03-20 09:00:00')
});

// Recurring notifications
await notifications.schedule({
  title: 'Take a Break',
  body: 'Time to stretch!',
  every: 'hour'
});

// Daily at specific time
await notifications.schedule({
  title: 'Morning Routine',
  body: 'Start your day right',
  every: 'day',
  at: { hour: 7, minute: 30 }
});

// Multiple days per week
await notifications.schedule({
  title: 'Workout Time',
  body: 'Let\'s exercise!',
  every: 'week',
  days: ['monday', 'wednesday', 'friday'],
  at: { hour: 18, minute: 0 }
});

// With actions
await notifications.schedule({
  title: 'Task Due',
  body: 'Submit your report',
  in: { hours: 1 },
  actions: [
    { id: 'complete', title: 'Mark Complete' },
    { id: 'snooze', title: 'Snooze 1 hour' }
  ]
});

// Cancel notifications
const id = await notifications.schedule({...});
await notifications.cancel(id);

// Get all scheduled
const pending = await notifications.getPending();
```

### In-App Notifications (No Provider Required!)

```tsx
import { notifications } from 'notification-kit';

// Show in-app notifications from anywhere
notifications.success('Saved successfully!');
notifications.error('Something went wrong');
notifications.warning('Low battery');
notifications.info('New update available');

// Custom notification
notifications.showInApp({
	title: 'New Message',
	message: 'John sent you a message',
	type: 'info',
	duration: 5000, // 5 seconds
	position: 'top-right',
	action: {
		label: 'View',
		onClick: () => router.push('/messages'),
	},
});

// Or use the hook for component-specific notifications
import { useInAppNotification } from 'notification-kit/react';

function MyComponent() {
	const notify = useInAppNotification();

	const handleClick = () => {
		notify.success('Action completed!');
	};
}
```

## Configuration

### Global Configuration

```tsx
import { NotificationKit } from 'notification-kit';

// Configure once at app startup
NotificationKit.init({
	provider: 'firebase', // or 'onesignal'
	config: {
		// provider config
	},

	// Optional: In-app notification settings
	inApp: {
		position: 'top-right',
		duration: 4000,
		theme: {
			success: '#10B981',
			error: '#EF4444',
			warning: '#F59E0B',
			info: '#3B82F6',
		},
	},

	// Optional: Custom styles
	styles: {
		container: {
			zIndex: 9999,
			fontFamily: 'system-ui',
		},
	},
});
```

### Custom In-App Notification Styles

```tsx
// Configure in-app notification styles during initialization
NotificationKit.init({
	provider: 'firebase',
	config: { /* ... */ },
	inApp: {
		theme: {
			success: '#10B981',
			error: '#EF4444',
			warning: '#F59E0B',
			info: '#3B82F6',
		},
		position: 'top-right',
		duration: 4000,
	},
	styles: {
		container: {
			zIndex: 9999,
			fontFamily: 'system-ui',
		},
	},
});
```

## Platform Setup

### iOS

1. **Add to `ios/App/App/Info.plist`:**

```xml
<key>UIBackgroundModes</key>
<array>
  <string>fetch</string>
  <string>remote-notification</string>
</array>
```

2. **In Xcode:**
   - Enable Push Notifications capability
   - Add `GoogleService-Info.plist` (Firebase) to project

### Android

1. **For Firebase:**

   - Add `google-services.json` to `android/app/`
   - In `android/app/build.gradle`:
     ```gradle
     apply plugin: 'com.google.gms.google-services'
     ```
   - In `android/build.gradle`:
     ```gradle
     dependencies {
       classpath 'com.google.gms:google-services:4.4.0'
     }
     ```

2. **For OneSignal:**
   - No additional setup needed

### Web

1. **For Firebase:**

   - Create `public/firebase-messaging-sw.js`:

   ```js
   importScripts(
   	'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'
   );
   importScripts(
   	'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
   );

   firebase.initializeApp({
   	// Same config as in NotificationKit.init()
   });

   const messaging = firebase.messaging();
   ```

2. **For OneSignal:**
   - Automatically handled

## Advanced Usage

### Notification Channels (Android)

```tsx
// Create channels for Android 8+
await notifications.createChannel({
	id: 'important',
	name: 'Important Notifications',
	description: 'Critical app notifications',
	importance: 'high',
	sound: 'notification.wav',
	vibration: true,
	led: { color: '#FF0000', on: 1000, off: 500 },
});

// Use channel
await notifications.schedule({
	title: 'Important!',
	body: 'This is critical',
	channelId: 'important',
});
```

### Rich Notifications

```tsx
// With image
await notifications.schedule({
	title: 'New Photo',
	body: 'Check out this sunset!',
	image: 'https://example.com/sunset.jpg',
	in: { seconds: 5 },
});

// With progress bar (Android)
await notifications.schedule({
	title: 'Downloading...',
	body: 'file.zip',
	progress: {
		value: 65,
		max: 100,
	},
});

// With input field (iOS)
await notifications.schedule({
	title: 'Quick Reply',
	body: "Respond to John's message",
	inputField: {
		placeholder: 'Type your reply...',
		buttonTitle: 'Send',
	},
});
```

### Action Handlers

```tsx
// Handle notification actions
notifications.on('notificationActionPerformed', (event) => {
	if (event.actionId) {
		switch (event.actionId) {
			case 'complete':
				markTaskComplete(event.notification.id);
				break;
			case 'snooze':
				snoozeNotification(event.notification.id);
				break;
			case 'reply':
				sendReply(event.actionData);
				break;
		}
	}
});
```

### Notification Groups

```tsx
// Group notifications (Android)
await notifications.schedule({
	title: 'New Message',
	body: 'You have 3 new messages',
	group: 'messages',
	groupSummary: true,
});

// Add to group
await notifications.schedule({
	title: 'John Doe',
	body: 'Hey, how are you?',
	group: 'messages',
});
```

## TypeScript Support

Full TypeScript support with type definitions:

```tsx
import {
	NotificationKit,
	type Notification,
	type ScheduleOptions,
	type NotificationConfig,
	type InAppOptions,
} from 'notification-kit';

// Type-safe initialization
const config: NotificationConfig = {
	provider: 'firebase',
	config: {
		apiKey: process.env.FIREBASE_API_KEY!,
		// ... rest of config
	},
};

NotificationKit.init(config);

// Type-safe scheduling
const options: ScheduleOptions = {
	title: 'Meeting',
	body: 'Starting in 10 minutes',
	in: { minutes: 10 },
	data: { meetingId: '123' },
};

await notifications.schedule(options);
```

## API Reference

### Initialization

```tsx
NotificationKit.init(config: NotificationConfig)
```

### Core Functions

```tsx
// Permissions
notifications.requestPermission(): Promise<boolean>
notifications.isPermissionGranted(): Promise<boolean>
notifications.getToken(): Promise<string>

// Push Notifications
notifications.subscribe(topic: string): Promise<void>
notifications.unsubscribe(topic: string): Promise<void>
notifications.onPush(callback: (notification) => void): () => void
notifications.onPushOpened(callback: (notification) => void): () => void

// Local Notifications
notifications.schedule(options: ScheduleOptions): Promise<string>
notifications.cancel(id: string): Promise<void>
notifications.cancelAll(): Promise<void>
notifications.getPending(): Promise<Notification[]>

// In-App Notifications
notifications.success(message: string, options?: InAppOptions)
notifications.error(message: string, options?: InAppOptions)
notifications.warning(message: string, options?: InAppOptions)
notifications.info(message: string, options?: InAppOptions)
notifications.showInApp(options: InAppOptions)

// Channels (Android)
notifications.createChannel(channel: Channel): Promise<void>
notifications.deleteChannel(id: string): Promise<void>
notifications.listChannels(): Promise<Channel[]>

// Events
notifications.on(event: string, callback: (data) => void): () => void
notifications.off(event: string, callback?: (data) => void): void
```

### React Hooks

```tsx
// Main hook
const {
  requestPermission,
  isPermissionGranted,
  token,
  subscribe,
  unsubscribe
} = useNotifications();

// In-app notifications hook
const notify = useInAppNotification();
notify.success(message, options?)
notify.error(message, options?)
notify.warning(message, options?)
notify.info(message, options?)
notify.show(options)
```

## Best Practices

1. **Initialize Early** - Call `NotificationKit.init()` as early as possible in your app
2. **Check Permissions** - Always check if permissions are granted before scheduling
3. **Handle Errors** - Wrap notification calls in try-catch blocks
4. **Test on Devices** - Push notifications don't work on simulators
5. **Use Topics** - Subscribe users to topics for targeted notifications

## Troubleshooting

**Initialization Issues?**

- Ensure `NotificationKit.init()` is called before using any notification features
- Check console for initialization errors
- Verify your provider config is correct

**Notifications not working on iOS?**

- Check Push Notifications capability is enabled
- Test on real device (not simulator)
- Verify certificates are configured correctly

**In-app notifications not showing?**

- Check browser console for errors
- Ensure no CSS is overriding notification styles
- Verify `NotificationKit.init()` was called

## License

MIT

## 🔗 Links

- [**NPM Package**](https://www.npmjs.com/package/notification-kit) - View on NPM registry
- [**GitHub Repository**](https://github.com/aoneahsan/notification-kit) - Source code and contributions
- [**Documentation**](https://github.com/aoneahsan/notification-kit/wiki) - Full documentation
- [**Examples**](https://github.com/aoneahsan/notification-kit/tree/main/examples) - Sample implementations
- [**Issues**](https://github.com/aoneahsan/notification-kit/issues) - Report bugs or request features
- [**Changelog**](https://github.com/aoneahsan/notification-kit/releases) - Version history

## 👨‍💻 Author

**Ahsan Mahmood**

- Website: [https://aoneahsan.com](https://aoneahsan.com)
- GitHub: [@aoneahsan](https://github.com/aoneahsan)
- Email: [aoneahsan@gmail.com](mailto:aoneahsan@gmail.com)

## 🎯 Design Principles

- **Type Safe** - Full TypeScript support with comprehensive type definitions
- **Framework Independent** - Core functionality works without any framework
- **Comprehensive Documentation** - Extensive docs covering every feature
- **Maximum Flexibility** - All options configurable with sensible defaults
- **User-First API** - Intuitive API design prioritizing developer experience
