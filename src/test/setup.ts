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

// Mock OneSignal (react-onesignal v3 namespaced API)
vi.mock('react-onesignal', () => ({
  __esModule: true,
  default: {
    init: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    Notifications: {
      permission: false,
      requestPermission: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    User: {
      addTag: vi.fn(),
      addTags: vi.fn(),
      removeTag: vi.fn(),
      removeTags: vi.fn(),
      getTags: vi.fn(() => ({})),
      PushSubscription: {
        id: undefined,
        token: undefined,
        optedIn: false,
        optIn: vi.fn(),
        optOut: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    },
    Slidedown: {
      promptPush: vi.fn(),
      promptPushCategories: vi.fn(),
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

// Mock the Web Storage API. jsdom on an opaque origin does not reliably expose
// a writable `localStorage`/`sessionStorage`, so we install an in-memory
// implementation on both `globalThis` and `window` for deterministic tests.
function createStorageMock(): Storage {
  let store: Record<string, string> = {}
  return {
    get length(): number {
      return Object.keys(store).length
    },
    clear(): void {
      store = {}
    },
    getItem(key: string): string | null {
      return store[key] ?? null
    },
    key(index: number): string | null {
      return Object.keys(store)[index] ?? null
    },
    removeItem(key: string): void {
      delete store[key]
    },
    setItem(key: string, value: string): void {
      store[key] = String(value)
    },
  } as Storage
}

const localStorageMock = createStorageMock()
const sessionStorageMock = createStorageMock()

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
})
Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: sessionStorageMock,
})
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  })
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: sessionStorageMock,
  })
}

// Reset all mocks + storage before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})
