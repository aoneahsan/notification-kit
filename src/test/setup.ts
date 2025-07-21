import { beforeEach, vi } from 'vitest'

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
    getPlatform: () => 'web',
    isPluginAvailable: () => true,
  },
  registerPlugin: vi.fn(),
}))

// Mock Capacitor Push Notifications
vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    requestPermissions: vi.fn(),
    checkPermissions: vi.fn(),
    register: vi.fn(),
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
    getDeliveredNotifications: vi.fn(),
    removeDeliveredNotifications: vi.fn(),
    removeAllDeliveredNotifications: vi.fn(),
    createChannel: vi.fn(),
    listChannels: vi.fn(),
    deleteChannel: vi.fn(),
  },
}))

// Mock Capacitor Local Notifications
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    requestPermissions: vi.fn(),
    checkPermissions: vi.fn(),
    schedule: vi.fn(),
    cancel: vi.fn(),
    getPending: vi.fn(),
    registerActionTypes: vi.fn(),
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
    createChannel: vi.fn(),
    listChannels: vi.fn(),
    deleteChannel: vi.fn(),
  },
}))

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    configure: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    keys: vi.fn(),
    migrate: vi.fn(),
  },
}))

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}))

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(),
  getToken: vi.fn(),
  onMessage: vi.fn(),
  deleteToken: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(true)),
}))

// Mock OneSignal
vi.mock('react-onesignal', () => ({
  __esModule: true,
  default: {
    init: vi.fn(),
    showNativePrompt: vi.fn(),
    isPushNotificationsEnabled: vi.fn(),
    getUserId: vi.fn(),
    getSubscription: vi.fn(),
    setSubscription: vi.fn(),
    sendTag: vi.fn(),
    sendTags: vi.fn(),
    getTags: vi.fn(),
    deleteTag: vi.fn(),
    deleteTags: vi.fn(),
    addListenerForNotificationOpened: vi.fn(),
    setNotificationWillShowInForegroundHandler: vi.fn(),
    setNotificationOpenedHandler: vi.fn(),
    setInAppMessageClickHandler: vi.fn(),
    addTrigger: vi.fn(),
    addTriggers: vi.fn(),
    removeTrigger: vi.fn(),
    removeTriggers: vi.fn(),
    getTriggers: vi.fn(),
    setLocation: vi.fn(),
    requestPermission: vi.fn(),
    registerForPushNotifications: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    Slidedown: {
      promptPush: vi.fn(),
      promptPushCategories: vi.fn(),
    },
    Notifications: {
      requestPermission: vi.fn(),
    },
  },
}))

// Mock DOM globals
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
 
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
 
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
