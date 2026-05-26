import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { NotificationKit, notifications } from '@/core/NotificationKit'
import { Logger } from '@/utils/logger'
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
  /** Convenience flag: true when `permission === 'granted'`. */
  isPermissionGranted: boolean

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
  const listenerIdCounterRef = useRef(0)

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
            Logger.debug('notification-kit: token retrieval failed at init', error)
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
   * Destroy the notification kit.
   *
   * NOTE: NotificationKit is a process-global singleton, so calling destroy()
   * tears it down for EVERY consumer of the kit/hook in the app — it is not
   * scoped to this component instance. Call it only when shutting notifications
   * down app-wide (e.g. on sign-out), not on routine component unmount.
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
          Logger.debug(
            'notification-kit: token retrieval failed after permission grant',
            error
          )
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
        setState(prev => ({
          ...prev,
          subscriptions: prev.subscriptions.includes(topic)
            ? prev.subscriptions
            : [...prev.subscriptions, topic],
        }))
      } catch (error) {
        updateState({ error: error as Error })
        throw error
      }
    },
    [updateState]
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
        setState(prev => ({
          ...prev,
          subscriptions: prev.subscriptions.filter(sub => sub !== topic),
        }))
      } catch (error) {
        updateState({ error: error as Error })
        throw error
      }
    },
    [updateState]
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

        // Collect only the scheduling fields. title/body belong on the
        // notification payload, NOT on the schedule object (the old code stuffed
        // empty title/body here, producing dead/confusing data).
        const schedule: Record<string, unknown> = {}
        if (at !== undefined) schedule.at = at
        if (inProp !== undefined) schedule.in = inProp
        if (every !== undefined) schedule.every = every
        if (count !== undefined) schedule.count = count
        if (until !== undefined) schedule.until = until
        if (on !== undefined) schedule.on = on
        if (days !== undefined) schedule.days = days
        if (timezone !== undefined) schedule.timezone = timezone
        if (allowWhileIdle !== undefined) schedule.allowWhileIdle = allowWhileIdle
        if (exact !== undefined) schedule.exact = exact
        if (wakeDevice !== undefined) schedule.wakeDevice = wakeDevice
        if (category !== undefined) schedule.category = category
        if (identifier !== undefined) schedule.identifier = identifier
        if (triggerInBackground !== undefined)
          schedule.triggerInBackground = triggerInBackground
        if (skipIfBatteryLow !== undefined)
          schedule.skipIfBatteryLow = skipIfBatteryLow
        if (respectQuietHours !== undefined)
          schedule.respectQuietHours = respectQuietHours

        const payload: LocalNotificationPayload = {
          ...notificationPayload,
          priority: priorityMap[priority || 'normal'] || 'default',
          schedule: schedule as any,
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
      // Monotonic counter avoids the Date.now() collisions that could overwrite
      // a prior listener's cleanup entry when two register in the same ms.
      const listenerId = `${event}-${++listenerIdCounterRef.current}`
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
          Logger.debug('notification-kit: token refresh failed during refresh', error)
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
    const notificationKit =
      notificationKitRef.current ?? NotificationKit.getInstance()

    try {
      return await notificationKit.isSupported()
    } catch (error) {
      // Support check failed, assume not supported
      return false
    }
  }, [])

  /**
   * In-app notification methods (memoized so the object identity is stable
   * across renders for consumers that depend on it).
   */
  const showInAppShow = useCallback(
    (options: InAppOptions) => notifications.showInApp(options),
    []
  )
  const showInAppSuccess = useCallback(
    (title: string, message?: string) => notifications.success(title, message),
    []
  )
  const showInAppError = useCallback(
    (title: string, message?: string) => notifications.error(title, message),
    []
  )
  const showInAppWarning = useCallback(
    (title: string, message?: string) => notifications.warning(title, message),
    []
  )
  const showInAppInfo = useCallback(
    (title: string, message?: string) => notifications.info(title, message),
    []
  )
  const showInApp = useMemo(
    () => ({
      show: showInAppShow,
      success: showInAppSuccess,
      error: showInAppError,
      warning: showInAppWarning,
      info: showInAppInfo,
    }),
    [
      showInAppShow,
      showInAppSuccess,
      showInAppError,
      showInAppWarning,
      showInAppInfo,
    ]
  )

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
      (event: any) => {
        // After the emit() envelope fix the received payload lives at
        // event.data.payload (mirrored at event.payload).
        const payload = event?.data?.payload ?? event?.payload ?? {}
        const inner = payload.notification ?? payload
        const incoming: Notification = {
          id: String(inner?.id ?? payload?.id ?? ''),
          title: payload?.title ?? inner?.title ?? '',
          body: payload?.body ?? inner?.body ?? '',
          data: payload?.data ?? inner?.data ?? {},
        }

        // Functional update (and no state.notifications dependency below) so the
        // effect registers listeners ONCE instead of tearing down and
        // re-subscribing on every received notification — which dropped any
        // event that arrived during the re-subscribe gap.
        setState(prev => ({
          ...prev,
          notifications: [...prev.notifications, incoming],
        }))
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
  }, [state.isInitialized, updateState])

  return {
    ...state,
    isPermissionGranted: state.permission === 'granted',
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
