import { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration with secure notification setup
 * Note: No hardcoded credentials here
 */
const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'MyApp',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;