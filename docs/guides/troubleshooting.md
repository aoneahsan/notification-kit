# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Module not found errors

**Problem:**
```
Module not found: Can't resolve 'notification-kit'
```

**Solution:**
1. Ensure the package is installed:
   ```bash
   yarn add notification-kit
   ```
2. Clear cache and reinstall:
   ```bash
   rm -rf node_modules
   yarn install
   ```
3. Check your import statement:
   ```typescript
   import { NotificationKit } from 'notification-kit';
   ```

#### TypeScript errors

**Problem:**
```
Cannot find module 'notification-kit' or its corresponding type declarations
```

**Solution:**
1. Ensure TypeScript is configured properly
2. Check `tsconfig.json` includes node_modules:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node"
     }
   }
   ```

### Initialization Issues

#### NotificationKit.init() fails

**Problem:**
```
Error: NotificationKit is already initialized
```

**Solution:**
```typescript
// Check if already initialized
if (!NotificationKit.getInstance().isInitialized()) {
  await NotificationKit.init(config);
}
```

#### Provider not found

**Problem:**
```
Error: Provider 'firebase' requires firebase package to be installed
```

**Solution:**
Install the required provider package:
```bash
# For Firebase
yarn add firebase

# For OneSignal
yarn add react-onesignal
```

### Permission Issues

#### Permission request shows no dialog

**Problem:**
Calling `requestPermission()` doesn't show permission dialog

**Possible Causes:**
1. Permission already denied
2. Not using HTTPS (web)
3. Running in simulator (iOS)

**Solution:**
```typescript
// Check permission status first
const status = await notifications.checkPermission();

if (status === 'prompt') {
  // Can request permission
  const granted = await notifications.requestPermission();
} else if (status === 'denied') {
  // User must manually enable in settings
  alert('Please enable notifications in your browser settings');
}
```

#### iOS permission always denied

**Solution:**
1. Ensure Push Notifications capability is enabled in Xcode
2. Check provisioning profile includes push notifications
3. Test on real device, not simulator

### Push Notification Issues

#### Notifications not received on iOS

**Checklist:**
1. ✓ Push Notifications capability enabled
2. ✓ Valid APNs certificate
3. ✓ Correct provisioning profile
4. ✓ Testing on real device
5. ✓ Background modes enabled
6. ✓ Device has internet connection

**Debug steps:**
```typescript
// Enable debug mode
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  debug: true
});

// Check token generation
const token = await notifications.getToken();
console.log('Token:', token);
```

#### Notifications not received on Android

**Checklist:**
1. ✓ google-services.json in correct location
2. ✓ Firebase project configured
3. ✓ Internet permission in manifest
4. ✓ Google Play Services installed
5. ✓ Not killed by battery optimization

**Debug steps:**
```bash
# Check logs
adb logcat | grep -i "notification\|firebase\|fcm"
```

#### Web push notifications not working

**Checklist:**
1. ✓ HTTPS enabled
2. ✓ Service worker registered
3. ✓ VAPID key configured
4. ✓ Browser supports notifications

**Debug steps:**
```typescript
// Check service worker
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.getRegistration();
  console.log('Service Worker:', registration);
}

// Check push manager
const subscription = await registration.pushManager.getSubscription();
console.log('Push Subscription:', subscription);
```

### Local Notification Issues

#### Scheduled notifications not firing

**Problem:**
Notifications scheduled but never appear

**Solution:**
1. Check app permissions:
   ```typescript
   const permission = await LocalNotifications.checkPermissions();
   if (permission.display !== 'granted') {
     await LocalNotifications.requestPermissions();
   }
   ```

2. Verify scheduling:
   ```typescript
   const pending = await notifications.getPending();
   console.log('Pending notifications:', pending);
   ```

#### Notification ID conflicts

**Problem:**
Notifications overwriting each other

**Solution:**
```typescript
// Use unique IDs
const id = await notifications.schedule({
  id: `notification-${Date.now()}`,
  title: 'Unique Notification',
  body: 'This won\'t be overwritten'
});
```

### In-App Notification Issues

#### Notifications not appearing

**Checklist:**
1. Check if NotificationKit is initialized
2. Verify no CSS conflicts
3. Check z-index issues

**Solution:**
```typescript
// Force high z-index
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  styles: {
    container: {
      zIndex: 999999
    }
  }
});
```

#### Styling not applied

**Problem:**
Custom styles not working

**Solution:**
```typescript
// Check style specificity
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  styles: {
    notification: {
      '!important': true,
      backgroundColor: '#custom-color'
    }
  }
});
```

### Platform-Specific Issues

#### Capacitor not syncing

**Problem:**
```
Error: Capacitor could not find the web assets directory
```

**Solution:**
```bash
# Build web assets first
npm run build

# Then sync
npx cap sync
```

#### Android build errors

**Problem:**
```
Execution failed for task ':app:processDebugGoogleServices'
```

**Solution:**
1. Ensure google-services.json is in `android/app/`
2. Check package name matches Firebase config
3. Update gradle dependencies

### Provider-Specific Issues

#### Firebase token errors

**Problem:**
```
FirebaseError: Messaging: The registration token is not a valid FCM registration token
```

**Solution:**
```typescript
// Refresh token
const newToken = await notifications.refreshToken();

// Delete and regenerate
await notifications.deleteToken();
const freshToken = await notifications.getToken();
```

#### OneSignal player ID issues

**Problem:**
Player ID not generating

**Solution:**
```typescript
// Wait for OneSignal to be ready
window.OneSignal = window.OneSignal || [];
OneSignal.push(async function() {
  await OneSignal.init({
    appId: "your-app-id"
  });
});
```

### Performance Issues

#### Memory leaks

**Problem:**
Memory usage increasing over time

**Solution:**
```typescript
// Always clean up event listeners
const unsubscribe = notifications.onPush((payload) => {
  // Handle notification
});

// Clean up when done
unsubscribe();

// Or use component lifecycle
useEffect(() => {
  const unsubscribe = notifications.onPush(handler);
  return () => unsubscribe();
}, []);
```

#### Slow initialization

**Solution:**
```typescript
// Lazy load providers
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  lazyLoad: true
});
```

### Debug Mode

Enable comprehensive debugging:

```typescript
NotificationKit.init({
  provider: 'firebase',
  config: firebaseConfig,
  debug: true,
  onError: (error) => {
    console.error('NotificationKit Error:', error);
    // Send to error tracking service
  }
});
```

### Getting Help

1. **Check the documentation**
   - Review relevant guides
   - Check API reference
   - Look at examples

2. **Enable debug mode**
   - Set `debug: true` in config
   - Check browser/device console
   - Use platform-specific debugging tools

3. **Search existing issues**
   - [GitHub Issues](https://github.com/aoneahsan/notification-kit/issues)
   - Check closed issues too

4. **Create a minimal reproduction**
   - Isolate the problem
   - Create simple test case
   - Share relevant code

5. **Open an issue**
   - Use issue template
   - Include all relevant details
   - Provide reproduction steps

### Error Codes Reference

| Error Code | Description | Solution |
|------------|-------------|----------|
| `NK001` | NotificationKit not initialized | Call `NotificationKit.init()` first |
| `NK002` | Provider not found | Install required provider package |
| `NK003` | Invalid configuration | Check configuration object |
| `NK004` | Permission denied | User must grant permission |
| `NK005` | Platform not supported | Check platform compatibility |
| `NK006` | Token generation failed | Check provider setup |
| `NK007` | Service worker error | Check HTTPS and SW path |
| `NK008` | Notification send failed | Check network and credentials |