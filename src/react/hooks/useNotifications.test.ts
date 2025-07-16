import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotifications } from './useNotifications'
import { NotificationKit } from '@/core/NotificationKit'
import type { NotificationConfig } from '@/types'

// Mock NotificationKit
const mockInstance = {
  init: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(false),
  requestPermission: vi.fn().mockResolvedValue(true),
  checkPermission: vi.fn().mockResolvedValue('prompt'),
  getToken: vi.fn().mockResolvedValue('test-token'),
  refreshToken: vi.fn().mockResolvedValue('new-token'),
  subscribe: vi.fn().mockResolvedValue(undefined),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
  scheduleLocalNotification: vi.fn().mockResolvedValue(undefined),
  cancelLocalNotification: vi.fn().mockResolvedValue(undefined),
  getPendingLocalNotifications: vi.fn().mockResolvedValue([]),
  createChannel: vi.fn().mockResolvedValue(undefined),
  deleteChannel: vi.fn().mockResolvedValue(undefined),
  listChannels: vi.fn().mockResolvedValue([]),
  on: vi.fn().mockReturnValue(() => {}),
  off: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(true),
}

vi.mock('@/core/NotificationKit', () => ({
  NotificationKit: {
    getInstance: vi.fn(() => mockInstance),
  },
  notifications: {
    showInApp: vi.fn().mockResolvedValue('notification-id'),
    success: vi.fn().mockResolvedValue('success-id'),
    error: vi.fn().mockResolvedValue('error-id'),
    warning: vi.fn().mockResolvedValue('warning-id'),
    info: vi.fn().mockResolvedValue('info-id'),
  },
}))

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should start with default state', () => {
      const { result } = renderHook(() => useNotifications())

      expect(result.current.isInitialized).toBe(false)
      expect(result.current.isInitializing).toBe(false)
      expect(result.current.permission).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.notifications).toEqual([])
      expect(result.current.pendingNotifications).toEqual([])
      expect(result.current.subscriptions).toEqual([])
    })

    it('should initialize NotificationKit', async () => {
      const { result } = renderHook(() => useNotifications())
      const config: NotificationConfig = {
        provider: 'firebase',
        config: {
          apiKey: 'test-api-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
          storageBucket: 'test.appspot.com',
          messagingSenderId: '123456789',
          appId: 'test-app-id',
        },
      }

      const mockKit = NotificationKit.getInstance()
      ;(mockKit.checkPermission as any).mockResolvedValue('granted')
      ;(mockKit.getToken as any).mockResolvedValue('test-token')

      await act(async () => {
        await result.current.init(config)
      })

      expect(result.current.isInitialized).toBe(true)
      expect(result.current.isInitializing).toBe(false)
      expect(result.current.permission).toBe('granted')
      expect(result.current.token).toBe('test-token')
      expect(mockKit.init).toHaveBeenCalledWith(config)
    })

    it('should handle initialization error', async () => {
      const { result } = renderHook(() => useNotifications())
      const config: NotificationConfig = {
        provider: 'firebase',
        config: {
          apiKey: 'test-api-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
          storageBucket: 'test.appspot.com',
          messagingSenderId: '123456789',
          appId: 'test-app-id',
        },
      }

      const error = new Error('Init failed')
      const mockKit = NotificationKit.getInstance()
      ;(mockKit.init as any).mockRejectedValue(error)

      await act(async () => {
        await expect(result.current.init(config)).rejects.toThrow('Init failed')
      })

      expect(result.current.isInitialized).toBe(false)
      expect(result.current.error).toBe(error)
    })
  })

  describe('permission methods', () => {
    it('should request permission', async () => {
      const { result } = renderHook(() => useNotifications())

      // Mock successful init
      mockInstance.init.mockResolvedValue(undefined)
      mockInstance.checkPermission.mockResolvedValue('prompt')
      mockInstance.getToken.mockResolvedValue('initial-token')

      // Initialize first
      await act(async () => {
        await result.current.init({
          provider: 'firebase',
          config: {
            apiKey: 'test',
            authDomain: 'test',
            projectId: 'test',
            storageBucket: 'test',
            messagingSenderId: 'test',
            appId: 'test',
          },
        })
      })

      // Now mock the permission request
      mockInstance.requestPermission.mockResolvedValue(true)
      mockInstance.checkPermission.mockResolvedValue('granted')
      mockInstance.getToken.mockResolvedValue('permission-token')

      await act(async () => {
        const granted = await result.current.requestPermission()
        expect(granted).toBe(true)
      })

      expect(result.current.permission).toBe('granted')
      expect(result.current.token).toBe('permission-token')
    })

    it('should check permission', async () => {
      const { result } = renderHook(() => useNotifications())

      // Mock successful init
      mockInstance.init.mockResolvedValue(undefined)
      mockInstance.checkPermission.mockResolvedValue('granted')
      mockInstance.getToken.mockResolvedValue('test-token')

      // Initialize first
      await act(async () => {
        await result.current.init({
          provider: 'firebase',
          config: {
            apiKey: 'test',
            authDomain: 'test',
            projectId: 'test',
            storageBucket: 'test',
            messagingSenderId: 'test',
            appId: 'test',
          },
        })
      })

      // Now check permission with different status
      mockInstance.checkPermission.mockResolvedValue('denied')

      await act(async () => {
        const permission = await result.current.checkPermission()
        expect(permission).toBe('denied')
      })

      expect(result.current.permission).toBe('denied')
    })
  })

  describe('subscription methods', () => {
    it('should subscribe to topic', async () => {
      const { result } = renderHook(() => useNotifications())

      // Mock successful init
      mockInstance.init.mockResolvedValue(undefined)
      mockInstance.checkPermission.mockResolvedValue('granted')
      mockInstance.getToken.mockResolvedValue('test-token')

      // Initialize first
      await act(async () => {
        await result.current.init({
          provider: 'firebase',
          config: {
            apiKey: 'test',
            authDomain: 'test',
            projectId: 'test',
            storageBucket: 'test',
            messagingSenderId: 'test',
            appId: 'test',
          },
        })
      })

      await act(async () => {
        await result.current.subscribe('news')
      })

      expect(result.current.subscriptions).toContain('news')
      expect(NotificationKit.getInstance().subscribe).toHaveBeenCalledWith(
        'news'
      )
    })

    it('should unsubscribe from topic', async () => {
      const { result } = renderHook(() => useNotifications())

      // Mock successful init
      mockInstance.init.mockResolvedValue(undefined)
      mockInstance.checkPermission.mockResolvedValue('granted')
      mockInstance.getToken.mockResolvedValue('test-token')

      // Initialize first
      await act(async () => {
        await result.current.init({
          provider: 'firebase',
          config: {
            apiKey: 'test',
            authDomain: 'test',
            projectId: 'test',
            storageBucket: 'test',
            messagingSenderId: 'test',
            appId: 'test',
          },
        })
      })

      // Subscribe first
      await act(async () => {
        await result.current.subscribe('news')
      })

      await act(async () => {
        await result.current.unsubscribe('news')
      })

      expect(result.current.subscriptions).not.toContain('news')
      expect(NotificationKit.getInstance().unsubscribe).toHaveBeenCalledWith(
        'news'
      )
    })
  })

  describe('in-app notifications', () => {
    it('should show success notification', async () => {
      const { result } = renderHook(() => useNotifications())
      const { notifications } = await import('@/core/NotificationKit')

      await act(async () => {
        const id = await result.current.showInApp.success(
          'Success!',
          'Operation completed'
        )
        expect(id).toBe('success-id')
      })

      expect(notifications.success).toHaveBeenCalledWith(
        'Success!',
        'Operation completed'
      )
    })

    it('should show error notification', async () => {
      const { result } = renderHook(() => useNotifications())
      const { notifications } = await import('@/core/NotificationKit')

      await act(async () => {
        const id = await result.current.showInApp.error(
          'Error!',
          'Something went wrong'
        )
        expect(id).toBe('error-id')
      })

      expect(notifications.error).toHaveBeenCalledWith(
        'Error!',
        'Something went wrong'
      )
    })

    it('should show warning notification', async () => {
      const { result } = renderHook(() => useNotifications())
      const { notifications } = await import('@/core/NotificationKit')

      await act(async () => {
        const id = await result.current.showInApp.warning(
          'Warning!',
          'Please be careful'
        )
        expect(id).toBe('warning-id')
      })

      expect(notifications.warning).toHaveBeenCalledWith(
        'Warning!',
        'Please be careful'
      )
    })

    it('should show info notification', async () => {
      const { result } = renderHook(() => useNotifications())
      const { notifications } = await import('@/core/NotificationKit')

      await act(async () => {
        const id = await result.current.showInApp.info('Info', 'Good to know')
        expect(id).toBe('info-id')
      })

      expect(notifications.info).toHaveBeenCalledWith('Info', 'Good to know')
    })
  })

  describe('local notifications', () => {
    it('should schedule notification', async () => {
      const { result } = renderHook(() => useNotifications())

      // Mock successful init
      mockInstance.init.mockResolvedValue(undefined)
      mockInstance.checkPermission.mockResolvedValue('granted')
      mockInstance.getToken.mockResolvedValue('test-token')

      // Initialize first
      await act(async () => {
        await result.current.init({
          provider: 'firebase',
          config: {
            apiKey: 'test',
            authDomain: 'test',
            projectId: 'test',
            storageBucket: 'test',
            messagingSenderId: 'test',
            appId: 'test',
          },
        })
      })

      const options = {
        id: 'test-1',
        title: 'Test Notification',
        body: 'This is a test',
        at: new Date(Date.now() + 60000),
      }

      await act(async () => {
        await result.current.scheduleNotification(options)
      })

      expect(
        NotificationKit.getInstance().scheduleLocalNotification
      ).toHaveBeenCalled()
    })

    it('should cancel notification', async () => {
      const { result } = renderHook(() => useNotifications())

      // Mock successful init
      mockInstance.init.mockResolvedValue(undefined)
      mockInstance.checkPermission.mockResolvedValue('granted')
      mockInstance.getToken.mockResolvedValue('test-token')

      // Initialize first
      await act(async () => {
        await result.current.init({
          provider: 'firebase',
          config: {
            apiKey: 'test',
            authDomain: 'test',
            projectId: 'test',
            storageBucket: 'test',
            messagingSenderId: 'test',
            appId: 'test',
          },
        })
      })

      await act(async () => {
        await result.current.cancelNotification(123)
      })

      expect(
        NotificationKit.getInstance().cancelLocalNotification
      ).toHaveBeenCalledWith(123)
    })
  })

  describe('utility methods', () => {
    it('should check if supported', async () => {
      const { result } = renderHook(() => useNotifications())

      mockInstance.isSupported.mockResolvedValue(true)

      await act(async () => {
        const supported = await result.current.isSupported()
        expect(supported).toBe(true)
      })

      expect(mockInstance.isSupported).toHaveBeenCalled()
    })

    it('should clear notifications', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.clearNotifications()
      })

      expect(result.current.notifications).toEqual([])
    })

    it('should clear error', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
