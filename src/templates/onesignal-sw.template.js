/**
 * OneSignal Service Worker Template
 * 
 * IMPORTANT: This is a template file. DO NOT hardcode your OneSignal App ID here.
 * The actual configuration will be handled by the OneSignal SDK at runtime.
 * 
 * Usage:
 * 1. Copy this file to your public directory as OneSignalSDKWorker.js
 * 2. OneSignal SDK will handle the configuration automatically
 * 3. Never commit OneSignal credentials to this file
 */

// Import OneSignal SDK
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

// The OneSignal SDK handles all service worker functionality
// No manual configuration needed here - it's all done through
// the NotificationKit.init() call in your application code

// Optional: Add custom service worker logic here if needed
// But avoid any hardcoded configuration values