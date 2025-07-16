import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useInAppNotification,
  useInAppNotificationSimple,
  useInAppNotificationQueue,
  useInAppNotificationPersistence,
} from './useInAppNotification'
import type { InAppOptions } from '@/types'

// Mock the inApp utilities
vi.mock('@/utils/inApp', () => ({
  InAppNotificationManager: {
    getInstance: vi.fn(() => ({
      // Mock instance methods if needed
    })),
  },
  showInAppNotification: vi
    .fn()
    .mockImplementation(() => Promise.resolve('notification-id')),
  dismissInAppNotification: vi.fn().mockResolvedValue(undefined),
  dismissAllInAppNotifications: vi.fn().mockResolvedValue(undefined),
  getActiveInAppNotifications: vi.fn().mockReturnValue([]),
  configureInAppNotifications: vi.fn(),
}))

describe('useInAppNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage
    localStorage.clear()
  })

  describe('basic functionality', () => {
    it('should start with default state', () => {
      const { result } = renderHook(() => useInAppNotification())

      expect(result.current.activeNotifications).toEqual([])
      expect(result.current.isConfigured).toBe(false)
      expect(result.current.config).toBeNull()
      expect(result.current.hasActive).toBe(false)
      expect(result.current.activeCount).toBe(0)
    })

    it('should configure in-app notifications', () => {
      const { result } = renderHook(() => useInAppNotification())
      const config = {
        position: 'top-center' as const,
        duration: 5000,
      }

      act(() => {
        result.current.configure(config)
      })

      expect(result.current.isConfigured).toBe(true)
      expect(result.current.config).toMatchObject(config)
    })

    it('should show notification', async () => {
      const { result } = renderHook(() => useInAppNotification())
      const { showInAppNotification } = await import('@/utils/inApp')

      const options: InAppOptions = {
        message: 'Test notification',
        type: 'info',
      }

      await act(async () => {
        const id = await result.current.show(options)
        expect(id).toBe('notification-id')
      })

      expect(showInAppNotification).toHaveBeenCalledWith(options, undefined)
    })

    it('should show success notification', async () => {
      const { result } = renderHook(() => useInAppNotification())
      const { showInAppNotification } = await import('@/utils/inApp')

      await act(async () => {
        const id = await result.current.success(
          'Success!',
          'Operation completed'
        )
        expect(id).toBe('notification-id')
      })

      expect(showInAppNotification).toHaveBeenCalledWith(
        {
          title: 'Success!',
          message: 'Operation completed',
          type: 'success',
        },
        undefined
      )
    })

    it('should show error notification', async () => {
      const { result } = renderHook(() => useInAppNotification())
      const { showInAppNotification } = await import('@/utils/inApp')

      await act(async () => {
        const id = await result.current.error('Error!', 'Something went wrong')
        expect(id).toBe('notification-id')
      })

      expect(showInAppNotification).toHaveBeenCalledWith(
        {
          title: 'Error!',
          message: 'Something went wrong',
          type: 'error',
        },
        undefined
      )
    })

    it('should dismiss notification', async () => {
      const { result } = renderHook(() => useInAppNotification())
      const { dismissInAppNotification } = await import('@/utils/inApp')

      await act(async () => {
        await result.current.dismiss('notification-id')
      })

      expect(dismissInAppNotification).toHaveBeenCalledWith('notification-id')
    })

    it('should dismiss all notifications', async () => {
      const { result } = renderHook(() => useInAppNotification())
      const { dismissAllInAppNotifications } = await import('@/utils/inApp')

      await act(async () => {
        await result.current.dismissAll()
      })

      expect(dismissAllInAppNotifications).toHaveBeenCalled()
    })
  })

  describe('event handlers', () => {
    it('should handle onShow callback', async () => {
      const { result } = renderHook(() => useInAppNotification())
      const onShowCallback = vi.fn()

      // Add callback
      act(() => {
        result.current.onShow(onShowCallback)
      })

      // Mock active notifications after show
      const { getActiveInAppNotifications } = await import('@/utils/inApp')
      ;(getActiveInAppNotifications as any).mockReturnValue([
        {
          id: 'notification-id',
          options: { message: 'Test' },
          timestamp: new Date(),
        },
      ])

      // Show notification
      await act(async () => {
        await result.current.show({ message: 'Test' })
      })

      // Wait for callback
      await waitFor(() => {
        expect(onShowCallback).toHaveBeenCalled()
      })
    })

    it('should handle onDismiss callback', async () => {
      const { result } = renderHook(() => useInAppNotification())
      const onDismissCallback = vi.fn()

      // Add callback
      act(() => {
        result.current.onDismiss(onDismissCallback)
      })

      // Dismiss notification
      await act(async () => {
        await result.current.dismiss('notification-id')
      })

      expect(onDismissCallback).toHaveBeenCalledWith('notification-id')
    })

    it('should unsubscribe callbacks', () => {
      const { result } = renderHook(() => useInAppNotification())
      const onShowCallback = vi.fn()

      // Add and remove callback
      let unsubscribe: () => void
      act(() => {
        unsubscribe = result.current.onShow(onShowCallback)
      })

      act(() => {
        unsubscribe()
      })

      // Callback should not be called after unsubscribe
      act(() => {
        result.current.show({ message: 'Test' })
      })

      expect(onShowCallback).not.toHaveBeenCalled()
    })
  })
})

describe('useInAppNotificationSimple', () => {
  it('should provide simplified API', async () => {
    const { result } = renderHook(() => useInAppNotificationSimple())

    expect(result.current.show).toBeDefined()
    expect(result.current.success).toBeDefined()
    expect(result.current.error).toBeDefined()
    expect(result.current.warning).toBeDefined()
    expect(result.current.info).toBeDefined()
    expect(result.current.dismiss).toBeDefined()
    expect(result.current.dismissAll).toBeDefined()
    expect(result.current.hasActive).toBeDefined()
    expect(result.current.activeCount).toBeDefined()

    // Should not include configuration methods
    expect(result.current).not.toHaveProperty('configure')
    expect(result.current).not.toHaveProperty('onShow')
    expect(result.current).not.toHaveProperty('onDismiss')
  })
})

describe('useInAppNotificationQueue', () => {
  it('should manage notification queue', async () => {
    const { result } = renderHook(() => useInAppNotificationQueue())

    expect(result.current.queue).toEqual([])
    expect(result.current.queueLength).toBe(0)
    expect(result.current.isProcessing).toBe(false)

    // Enqueue notifications
    act(() => {
      result.current.enqueue({ message: 'Notification 1' })
      result.current.enqueue({ message: 'Notification 2' })
    })

    expect(result.current.queue).toHaveLength(2)
    expect(result.current.queueLength).toBe(2)
  })

  it('should process queue when no active notifications', async () => {
    const { result } = renderHook(() => useInAppNotificationQueue())
    const { showInAppNotification } = await import('@/utils/inApp')

    // Enqueue notification
    act(() => {
      result.current.enqueue({ message: 'Queued notification' })
    })

    // Process should happen automatically
    await waitFor(() => {
      expect(showInAppNotification).toHaveBeenCalledWith(
        { message: 'Queued notification' },
        undefined
      )
    })
  })

  it('should clear queue', () => {
    const { result } = renderHook(() => useInAppNotificationQueue())

    // Add to queue
    act(() => {
      result.current.enqueue({ message: 'Notification 1' })
      result.current.enqueue({ message: 'Notification 2' })
    })

    // Clear queue
    act(() => {
      result.current.clearQueue()
    })

    expect(result.current.queue).toEqual([])
    expect(result.current.queueLength).toBe(0)
  })
})

describe('useInAppNotificationPersistence', () => {
  it('should persist notifications to localStorage', async () => {
    const { result } = renderHook(() => useInAppNotificationPersistence())

    // Mock active notifications
    const mockNotifications = [
      {
        id: 'test-1',
        options: { message: 'Test 1' },
        timestamp: new Date('2024-01-01'),
      },
    ]

    const { getActiveInAppNotifications } = await import('@/utils/inApp')
    ;(getActiveInAppNotifications as any).mockReturnValue(mockNotifications)

    // Trigger save
    act(() => {
      result.current.saveNotifications()
    })

    // Check localStorage
    const stored = localStorage.getItem('notification-kit-persisted')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].id).toBe('test-1')
  })

  it('should load persisted notifications', () => {
    // Set up localStorage
    const persistedData = [
      {
        id: 'persisted-1',
        options: { message: 'Persisted notification' },
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    ]
    localStorage.setItem(
      'notification-kit-persisted',
      JSON.stringify(persistedData)
    )

    const { result } = renderHook(() => useInAppNotificationPersistence())

    // Should load on mount
    expect(result.current.persistedNotifications).toHaveLength(1)
    expect(result.current.persistedNotifications[0].id).toBe('persisted-1')
  })

  it('should clear persistence', () => {
    // Set up localStorage
    localStorage.setItem(
      'notification-kit-persisted',
      JSON.stringify([{ id: 'test' }])
    )

    const { result } = renderHook(() => useInAppNotificationPersistence())

    // Clear persistence
    act(() => {
      result.current.clearPersistence()
    })

    expect(localStorage.getItem('notification-kit-persisted')).toBeNull()
    expect(result.current.persistedNotifications).toEqual([])
  })
})
