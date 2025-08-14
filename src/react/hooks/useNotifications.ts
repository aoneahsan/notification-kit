import { useEffect, useRef, useState, useCallback } from 'react'
import { NotificationKit, notifications } from '@/core/NotificationKit'
import type {
  NotificationConfig,
  PermissionStatus,
  ScheduleOptions,
  Notification,
  NotificationChannel,
  NotificationEventCallback,
  NotificationEventMap,
  LocalNotificationPayload,
  InAppOptions,
} from '@/types'

/**
 * Hook state interface
 */
export interface UseNotificationsState {
  isInitialized: boolean
  isInitializing: boolean
  permission: PermissionStatus | null
  token: string | null
  error: Error | null
  notifications: Notification[]
  pendingNotifications: Notification[]
  subscriptions: string[]
}

/**
 * Hook return interface
 */
export interface UseNotificationsReturn extends UseNotificationsState {
  // Initialization
  init: (config: NotificationConfig) => Promise<void>
  destroy: () => Promise<void>

  // Permissions
  requestPermission: () => Promise<boolean>
  checkPermission: () => Promise<PermissionStatus>

  // Token management
  getToken: () => Promise<string>
  refreshToken: () => Promise<string>

  // Subscriptions
  subscribe: (topic: string) => Promise<void>
  unsubscribe: (topic: string) => Promise<void>

  // Local notifications
  scheduleNotification: (
    options: ScheduleOptions & { id: string; title: string; body: string }
  ) => Promise<void>
  cancelNotification: (id: number) => Promise<void>
  getPendingNotifications: () => Promise<Notification[]>

  // Channels (Android)
  createChannel: (channel: NotificationChannel) => Promise<void>
  deleteChannel: (channelId: string) => Promise<void>
  listChannels: () => Promise<NotificationChannel[]>

  // Event listeners
  addEventListener: <T extends keyof NotificationEventMap>(
    event: T,
    callback: NotificationEventCallback<NotificationEventMap[T]>
  ) => () => void

  // In-app notifications
  showInApp: {
    show: (options: InAppOptions) => Promise<string>
    success: (title: string, message?: string) => Promise<string>
    error: (title: string, message?: string) => Promise<string>
    warning: (title: string, message?: string) => Promise<string>
    info: (title: string, message?: string) => Promise<string>
  }

  // Utilities
  clearNotifications: () => void
  clearError: () => void
  refresh: () => Promise<void>
  isSupported: () => Promise<boolean>
}

/**
 * Main notifications hook
 */
export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<UseNotificationsState>({
    isInitialized: false,
    isInitializing: false,
    permission: null,
    token: null,
    error: null,
    notifications: [],
    pendingNotifications: [],
    subscriptions: [],
  })

  const notificationKitRef = useRef<NotificationKit | null>(null)
  const eventListenersRef = useRef<Map<string, () => void>>(new Map())

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<UseNotificationsState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Initialize notification kit
   */
  const init = useCallback(
    async (config: NotificationConfig) => {
      try {
        updateState({ isInitializing: true, error: null })

        notificationKitRef.current = NotificationKit.getInstance()
        await notificationKitRef.current.init(config)

        // Check initial permission
        const permission = await notificationKitRef.current.checkPermission()

        // Get token if permission is granted
        let token = null
        if (permission === 'granted') {
          try {
            token = await notificationKitRef.current.getToken()
          } catch (error) {
            // Token retrieval failed, continue without token
          }
        }

        updateState({
          isInitialized: true,
          isInitializing: false,
          permission,
          token,
        })
      } catch (error) {
        updateState({
          isInitialized: false,
          isInitializing: false,
          error: error as Error,
        })
        throw error
      }
    },
    [updateState]
  )

  /**
   * Destroy notification kit
   */
  const destroy = useCallback(async () => {
    try {
      // Clean up event listeners
      eventListenersRef.current.forEach(unsubscribe => unsubscribe())
      eventListenersRef.current.clear()

      if (notificationKitRef.current) {
        await notificationKitRef.current.destroy()
        notificationKitRef.current = null
      }

      updateState({
        isInitialized: false,
        isInitializing: false,
        permission: null,
        token: null,
        error: null,
        notifications: [],
        pendingNotifications: [],
        subscriptions: [],
      })
    } catch (error) {
      updateState({ error: error as Error })
      throw error
    }
  }, [updateState])

  /**
   * Request permission
   */
  const requestPermission = useCallback(async () => {
    if (!notificationKitRef.current) {
      throw new Error('NotificationKit not initialized')
    }

    try {
      const granted = await notificationKitRef.current.requestPermission()
      const permission = await notificationKitRef.current.checkPermission()

      let token = null
      if (granted) {
        try {
          token = await notificationKitRef.current.getToken()
        } catch (error) {
          // Token retrieval failed after permission, continue without token
        }
      }

      updateState({ permission, token })
      return granted
    } catch (error) {
      updateState({ error: error as Error })
      throw error
    }
  }, [updateState])

  /**
   * Check permission
   */
  const checkPermission = useCallback(async () => {
    if (!notificationKitRef.current) {
      throw new Error('NotificationKit not initialized')
    }

    try {
      const permission = await notificationKitRef.current.checkPermission()
      updateState({ permission })
      return permission
    } catch (error) {
      updateState({ error: error as Error })
      throw error
    }
  }, [updateState])

  /**
   * Get token
   */
  const getToken = useCallback(async () => {
    if (!notificationKitRef.current) {
      throw new Error('NotificationKit not initialized')
    }

    try {
      const token = await notificationKitRef.current.getToken()
      updateState({ token })
      return token
    } catch (error) {
      updateState({ error: error as Error })
      throw error
    }
  }, [updateState])

  /**
   * Refresh token
   */
  const refreshToken = useCallback(async () => {
    if (!notificationKitRef.current) {
      throw new Error('NotificationKit not initialized')
    }

    try {
      const token = await notificationKitRef.current.getToken()
      updateState({ token })
      return token
    } catch (error) {
      updateState({ error: error as Error })
      throw error
    }
  }, [updateState])

  /**
   * Subscribe to topic
   */
  const subscribe = useCallback(
    async (topic: string) => {
      if (!notificationKitRef.current) {
        throw new Error('NotificationKit not initialized')
      }

      try {
        await notificationKitRef.current.subscribe(topic)
        updateState({
          subscriptions: [...state.subscriptions, topic],
        })
      } catch (error) {
        updateState({ error: error as Error })
        throw error
      }
    },
    [state.subscriptions, updateState]
  )

  /**
   * Unsubscribe from topic
   */
  const unsubscribe = useCallback(
    async (topic: string) => {
      if (!notificationKitRef.current) {
        throw new Error('NotificationKit not initialized')
      }

      try {
        await notificationKitRef.current.unsubscribe(topic)
        updateState({
          subscriptions: state.subscriptions.filter(sub => sub !== topic),
        })
      } catch (error) {
        updateState({ error: error as Error })
        throw error
      }
    },
    [state.subscriptions, updateState]
  )

  /**
   * Schedule notification
   */
  const scheduleNotification = useCallback(
    async (
      options: ScheduleOptions & { id: string; title: string; body: string }
    ) => {
      if (!notificationKitRef.current) {
        throw new Error('NotificationKit not initialized')
      }

      try {
        // Convert to LocalNotificationPayload format
        // Map SchedulePriority to NotificationPriority
        const priorityMap: Record<string, any> = {
          low: 'low',
          normal: 'default',
          high: 'high',
          urgent: 'max',
        }

        // Create the payload without schedule property first
        const {
          at,
          in: inProp,
          every,
          count,
          until,
          on,
          days,
          timezone,
          allowWhileIdle,
          exact,
          wakeDevice,
          priority,
          category,
          identifier,
          triggerInBackground,
          skipIfBatteryLow,
          respectQuietHours,
          ...notificationPayload
        } = options

        const scheduleOptions: ScheduleOptions = {
          title: '',
          body: ''
        }
        if (at !== undefined) scheduleOptions.at = at
        if (inProp !== undefined) scheduleOptions.in = inProp
        if (every !== undefined) scheduleOptions.every = every
        if (count !== undefined) scheduleOptions.count = count
        if (until !== undefined) scheduleOptions.until = until
        if (on !== undefined) scheduleOptions.on = on
        if (days !== undefined) scheduleOptions.days = days
        if (timezone !== undefined) scheduleOptions.timezone = timezone
        if (allowWhileIdle !== undefined)
          scheduleOptions.allowWhileIdle = allowWhileIdle
        if (exact !== undefined) scheduleOptions.exact = exact
        if (wakeDevice !== undefined) scheduleOptions.wakeDevice = wakeDevice
        if (priority !== undefined) scheduleOptions.priority = priority
        if (category !== undefined) scheduleOptions.category = category
        if (identifier !== undefined) scheduleOptions.identifier = identifier
        if (triggerInBackground !== undefined)
          scheduleOptions.triggerInBackground = triggerInBackground
        if (skipIfBatteryLow !== undefined)
          scheduleOptions.skipIfBatteryLow = skipIfBatteryLow
        if (respectQuietHours !== undefined)
          scheduleOptions.respectQuietHours = respectQuietHours

        const payload: LocalNotificationPayload = {
          ...notificationPayload,
          priority: priorityMap[priority || 'normal'] || 'default',
          schedule: scheduleOptions as any,
        }

        await notificationKitRef.current.scheduleLocalNotification(
          payload as any
        )
        // Refresh pending notifications
        const pending =
          await notificationKitRef.current.getPendingLocalNotifications()
        updateState({ pendingNotifications: pending })
      } catch (error) {
        updateState({ error: error as Error })
        throw error
      }
    },
    [updateState]
  )

  /**
   * Cancel notification
   */
  const cancelNotification = useCallback(
    async (id: number) => {
      if (!notificationKitRef.current) {
        throw new Error('NotificationKit not initialized')
      }

      try {
        await notificationKitRef.current.cancelLocalNotification(id)
        // Refresh pending notifications
        const pending =
          await notificationKitRef.current.getPendingLocalNotifications()
        updateState({ pendingNotifications: pending })
      } catch (error) {
        updateState({ error: error as Error })
        throw error
      }
    },
    [updateState]
  )

  /**
   * Get pending notifications
   */
  const getPendingNotifications = useCallback(async () => {
    if (!notificationKitRef.current) {
      throw new Error('NotificationKit not initialized')
    }

    try {
      const pending =
        await notificationKitRef.current.getPendingLocalNotifications()
      updateState({ pendingNotifications: pending })
      return pending
    } catch (error) {
      updateState({ error: error as Error })
      throw error
    }
  }, [updateState])

  /**
   * Create channel
   */
  const createChannel = useCallback(
    async (channel: NotificationChannel) => {
      if (!notificationKitRef.current) {
        throw new Error('NotificationKit not initialized')
      }

      try {
        await notificationKitRef.current.createChannel(channel)
      } catch (error) {
        updateState({ error: error as Error })
        throw error
      }
    },
    [updateState]
  )

  /**
   * Delete channel
   */
  const deleteChannel = useCallback(
    async (channelId: string) => {
      if (!notificationKitRef.current) {
        throw new Error('NotificationKit not initialized')
      }

      try {
        await notificationKitRef.current.deleteChannel(channelId)
      } catch (error) {
        updateState({ error: error as Error })
        throw error
      }
    },
    [updateState]
  )

  /**
   * List channels
   */
  const listChannels = useCallback(async () => {
    if (!notificationKitRef.current) {
      throw new Error('NotificationKit not initialized')
    }

    try {
      return await notificationKitRef.current.listChannels()
    } catch (error) {
      updateState({ error: error as Error })
      throw error
    }
  }, [updateState])

  /**
   * Add event listener
   */
  const addEventListener = useCallback(
    <T extends keyof NotificationEventMap>(
      event: T,
      callback: NotificationEventCallback<NotificationEventMap[T]>
    ) => {
      if (!notificationKitRef.current) {
        throw new Error('NotificationKit not initialized')
      }

      const unsubscribe = notificationKitRef.current.on(event, callback)
      const listenerId = `${event}-${Date.now()}`
      eventListenersRef.current.set(listenerId, unsubscribe)

      return () => {
        unsubscribe()
        eventListenersRef.current.delete(listenerId)
      }
    },
    []
  )

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    updateState({ notifications: [] })
  }, [updateState])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    if (!notificationKitRef.current) {
      return
    }

    try {
      const [permission, pending] = await Promise.all([
        notificationKitRef.current.checkPermission(),
        notificationKitRef.current.getPendingLocalNotifications(),
      ])

      let token = null
      if (permission === 'granted') {
        try {
          token = await notificationKitRef.current.getToken()
        } catch (error) {
          // Token refresh failed, continue without token
        }
      }

      updateState({
        permission,
        token,
        pendingNotifications: pending,
      })
    } catch (error) {
      updateState({ error: error as Error })
      throw error
    }
  }, [updateState])

  /**
   * Check if notifications are supported
   */
  const isSupported = useCallback(async () => {
    if (!notificationKitRef.current) {
      return false
    }

    try {
      return await notificationKitRef.current.isSupported()
    } catch (error) {
      // Support check failed, assume not supported
      return false
    }
  }, [])

  /**
   * In-app notification methods
   */
  const showInApp = {
    show: useCallback(async (options: InAppOptions) => {
      return await notifications.showInApp(options)
    }, []),
    success: useCallback(async (title: string, message?: string) => {
      return await notifications.success(title, message)
    }, []),
    error: useCallback(async (title: string, message?: string) => {
      return await notifications.error(title, message)
    }, []),
    warning: useCallback(async (title: string, message?: string) => {
      return await notifications.warning(title, message)
    }, []),
    info: useCallback(async (title: string, message?: string) => {
      return await notifications.info(title, message)
    }, []),
  }

  /**
   * Setup event listeners on initialization
   */
  useEffect(() => {
    if (!notificationKitRef.current || !state.isInitialized) {
      return
    }

    // Listen for notifications
    const unsubscribeNotification = notificationKitRef.current.on(
      'notificationReceived',
      event => {
        const notification: Notification = {
          id: event.notification?.id || '',
          title: event.notification?.title || '',
          body: event.notification?.body || '',
          data: event.notification?.data || {},
        }

        updateState({
          notifications: [...state.notifications, notification],
        })
      }
    )

    // Listen for token refresh
    const unsubscribeToken = notificationKitRef.current.on(
      'tokenRefreshed',
      data => {
        updateState({ token: data.token ?? null })
      }
    )

    // Listen for permission changes
    const unsubscribePermission = notificationKitRef.current.on(
      'permissionChanged',
      data => {
        updateState({
          permission: data.status,
        })
      }
    )

    // Listen for errors
    const unsubscribeError = notificationKitRef.current.on('error', data => {
      updateState({ error: data.error ?? null })
    })

    return () => {
      unsubscribeNotification()
      unsubscribeToken()
      unsubscribePermission()
      unsubscribeError()
    }
  }, [state.isInitialized, state.notifications, updateState])

  return {
    ...state,
    init,
    destroy,
    requestPermission,
    checkPermission,
    getToken,
    refreshToken,
    subscribe,
    unsubscribe,
    scheduleNotification,
    cancelNotification,
    getPendingNotifications,
    createChannel,
    deleteChannel,
    listChannels,
    addEventListener,
    showInApp,
    clearNotifications,
    clearError,
    refresh,
    isSupported,
  }
}
