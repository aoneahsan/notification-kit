import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  InAppNotificationManager,
  type InAppNotificationInstance,
  showInAppNotification,
  dismissInAppNotification,
  dismissAllInAppNotifications,
  getActiveInAppNotifications,
  configureInAppNotifications,
} from '@/utils/inApp'
import { Logger } from '@/utils/logger'
import type { InAppOptions, InAppConfig } from '@/types'

/**
 * Hook state interface
 */
export interface UseInAppNotificationState {
  activeNotifications: InAppNotificationInstance[]
  isConfigured: boolean
  config: InAppConfig | null
}

/**
 * Hook return interface
 */
export interface UseInAppNotificationReturn extends UseInAppNotificationState {
  // Configuration
  configure: (config: InAppConfig) => void

  // Show notifications
  show: (options: InAppOptions) => Promise<string>
  success: (
    title: string,
    message?: string,
    options?: Partial<InAppOptions>
  ) => Promise<string>
  error: (
    title: string,
    message?: string,
    options?: Partial<InAppOptions>
  ) => Promise<string>
  warning: (
    title: string,
    message?: string,
    options?: Partial<InAppOptions>
  ) => Promise<string>
  info: (
    title: string,
    message?: string,
    options?: Partial<InAppOptions>
  ) => Promise<string>

  // Dismiss notifications
  dismiss: (id: string) => Promise<void>
  dismissAll: () => Promise<void>

  // Utilities
  getActive: () => InAppNotificationInstance[]
  hasActive: boolean
  activeCount: number

  // Event handlers
  onShow: (
    callback: (notification: InAppNotificationInstance) => void
  ) => () => void
  onDismiss: (callback: (id: string) => void) => () => void
}

/**
 * In-app notification hook
 */
export function useInAppNotification(): UseInAppNotificationReturn {
  const [state, setState] = useState<UseInAppNotificationState>({
    activeNotifications: [],
    isConfigured: false,
    config: null,
  })

  const managerRef = useRef<InAppNotificationManager | null>(null)
  const showCallbacksRef = useRef<
    Set<(notification: InAppNotificationInstance) => void>
  >(new Set())
  const dismissCallbacksRef = useRef<Set<(id: string) => void>>(new Set())
  const mountedRef = useRef(true)

  /**
   * Update state helper
   */
  const updateState = useCallback(
    (updates: Partial<UseInAppNotificationState>) => {
      setState(prev => ({ ...prev, ...updates }))
    },
    []
  )

  /**
   * Initialize manager
   */
  const initializeManager = useCallback(() => {
    if (!managerRef.current) {
      managerRef.current = InAppNotificationManager.getInstance()
    }
    return managerRef.current
  }, [])

  /**
   * Update active notifications
   */
  const updateActiveNotifications = useCallback(() => {
    if (!mountedRef.current) {
      return
    }
    updateState({ activeNotifications: getActiveInAppNotifications() })
  }, [updateState])

  /**
   * Configure in-app notifications
   */
  const configure = useCallback(
    (config: InAppConfig) => {
      initializeManager()
      configureInAppNotifications(config)
      setState(prev => ({
        ...prev,
        isConfigured: true,
        config: { ...prev.config, ...config },
      }))
    },
    [initializeManager]
  )

  /**
   * Show notification
   */
  const show = useCallback(
    async (options: InAppOptions) => {
      initializeManager()

      // The manager retains config set via configure(); no need to re-pass it.
      const id = await showInAppNotification(options)

      // Reflect the change immediately (the manager subscription also fires, but
      // an explicit update avoids waiting a tick); then notify show callbacks.
      updateActiveNotifications()
      const notification = getActiveInAppNotifications().find(n => n.id === id)
      if (notification) {
        showCallbacksRef.current.forEach(callback => {
          try {
            callback(notification)
          } catch (error) {
            Logger.warn('notification-kit: onShow callback threw', error)
          }
        })
      }

      return id
    },
    [initializeManager, updateActiveNotifications]
  )

  /**
   * Show success notification
   */
  const success = useCallback(
    async (
      title: string,
      message?: string,
      options?: Partial<InAppOptions>
    ) => {
      return await show({
        title,
        message: message ?? title,
        type: 'success',
        ...options,
      })
    },
    [show]
  )

  /**
   * Show error notification
   */
  const error = useCallback(
    async (
      title: string,
      message?: string,
      options?: Partial<InAppOptions>
    ) => {
      return await show({
        title,
        message: message ?? title,
        type: 'error',
        ...options,
      })
    },
    [show]
  )

  /**
   * Show warning notification
   */
  const warning = useCallback(
    async (
      title: string,
      message?: string,
      options?: Partial<InAppOptions>
    ) => {
      return await show({
        title,
        message: message ?? title,
        type: 'warning',
        ...options,
      })
    },
    [show]
  )

  /**
   * Show info notification
   */
  const info = useCallback(
    async (
      title: string,
      message?: string,
      options?: Partial<InAppOptions>
    ) => {
      return await show({
        title,
        message: message ?? title,
        type: 'info',
        ...options,
      })
    },
    [show]
  )

  /**
   * Dismiss notification
   */
  const dismiss = useCallback(
    async (id: string) => {
      await dismissInAppNotification(id)

      updateActiveNotifications()
      dismissCallbacksRef.current.forEach(callback => {
        try {
          callback(id)
        } catch (error) {
          Logger.warn('notification-kit: onDismiss callback threw', error)
        }
      })
    },
    [updateActiveNotifications]
  )

  /**
   * Dismiss all notifications
   */
  const dismissAll = useCallback(async () => {
    const activeIds = getActiveInAppNotifications().map(n => n.id)

    await dismissAllInAppNotifications()

    updateActiveNotifications()
    activeIds.forEach(id => {
      dismissCallbacksRef.current.forEach(callback => {
        try {
          callback(id)
        } catch (error) {
          Logger.warn('notification-kit: onDismiss callback threw', error)
        }
      })
    })
  }, [updateActiveNotifications])

  /**
   * Get active notifications
   */
  const getActive = useCallback(() => {
    return getActiveInAppNotifications()
  }, [])

  /**
   * Add show callback
   */
  const onShow = useCallback(
    (callback: (notification: InAppNotificationInstance) => void) => {
      showCallbacksRef.current.add(callback)

      return () => {
        showCallbacksRef.current.delete(callback)
      }
    },
    []
  )

  /**
   * Add dismiss callback
   */
  const onDismiss = useCallback((callback: (id: string) => void) => {
    dismissCallbacksRef.current.add(callback)

    return () => {
      dismissCallbacksRef.current.delete(callback)
    }
  }, [])

  /**
   * Subscribe to manager changes (replaces the old 1 Hz polling) and load the
   * initial active list. The subscription fires on every show and dismiss, so
   * the component re-renders only when the notification set actually changes.
   */
  useEffect(() => {
    mountedRef.current = true
    const manager = initializeManager()
    const unsubscribe = manager.subscribe(updateActiveNotifications)
    updateActiveNotifications()

    return () => {
      mountedRef.current = false
      unsubscribe()
    }
  }, [initializeManager, updateActiveNotifications])

  /**
   * Clear callback registries on unmount.
   */
  useEffect(() => {
    const showCallbacks = showCallbacksRef.current
    const dismissCallbacks = dismissCallbacksRef.current
    return () => {
      showCallbacks.clear()
      dismissCallbacks.clear()
    }
  }, [])

  return useMemo(
    () => ({
      ...state,
      configure,
      show,
      success,
      error,
      warning,
      info,
      dismiss,
      dismissAll,
      getActive,
      hasActive: state.activeNotifications.length > 0,
      activeCount: state.activeNotifications.length,
      onShow,
      onDismiss,
    }),
    [
      state,
      configure,
      show,
      success,
      error,
      warning,
      info,
      dismiss,
      dismissAll,
      getActive,
      onShow,
      onDismiss,
    ]
  )
}

/**
 * Simplified hook for basic in-app notifications
 */
export function useInAppNotificationSimple() {
  const {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    hasActive,
    activeCount,
  } = useInAppNotification()

  return {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    hasActive,
    activeCount,
  }
}

/**
 * Hook for notification queue management
 */
export function useInAppNotificationQueue() {
  const [queue, setQueue] = useState<InAppOptions[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { show, hasActive } = useInAppNotification()
  const queueRef = useRef<InAppOptions[]>([])

  /**
   * Add to queue
   */
  const enqueue = useCallback((options: InAppOptions) => {
    setQueue(prev => {
      const nextQueue = [...prev, options]
      queueRef.current = nextQueue
      return nextQueue
    })
  }, [])

  /**
   * Process queue
   */
  const processQueue = useCallback(async () => {
    if (isProcessing || hasActive) {
      return
    }

    const next = queueRef.current[0]
    if (!next) {
      return
    }

    setIsProcessing(true)

    try {
      await show(next)
      setQueue(prev => {
        const nextQueue = prev.slice(1)
        queueRef.current = nextQueue
        return nextQueue
      })
    } catch (error) {
      // Queue processing error, continue
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, hasActive, show])

  /**
   * Clear queue
   */
  const clearQueue = useCallback(() => {
    queueRef.current = []
    setQueue([])
  }, [])

  /**
   * Process queue when conditions are met
   */
  useEffect(() => {
    if (!hasActive && queue.length > 0 && !isProcessing) {
      processQueue()
    }
  }, [hasActive, queue.length, isProcessing, processQueue])

  return {
    queue,
    queueLength: queue.length,
    isProcessing,
    enqueue,
    processQueue,
    clearQueue,
  }
}

/**
 * Hook for notification persistence
 */
export function useInAppNotificationPersistence() {
  const [persistedNotifications, setPersistedNotifications] = useState<
    InAppNotificationInstance[]
  >([])
  const { activeNotifications } = useInAppNotification()
  const hasLoadedPersistenceRef = useRef(false)

  /**
   * Save to persistence
   */
  const saveNotifications = useCallback(() => {
    try {
      const currentNotifications = getActiveInAppNotifications()
      const serialized = currentNotifications.map(n => ({
        id: n.id,
        options: n.options,
        timestamp: n.timestamp.toISOString(),
      }))
      localStorage.setItem(
        'notification-kit-persisted',
        JSON.stringify(serialized)
      )
    } catch (error) {
      // Persistence failed, continue without saving
    }
  }, [])

  /**
   * Load from persistence
   */
  const loadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem('notification-kit-persisted')
      if (stored) {
        const parsed = JSON.parse(stored)
        setPersistedNotifications(
          parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        )
      }
      hasLoadedPersistenceRef.current = true
    } catch (error) {
      // Failed to load persisted notifications, continue with empty list
      hasLoadedPersistenceRef.current = true
    }
  }, [])

  /**
   * Clear persistence
   */
  const clearPersistence = useCallback(() => {
    try {
      localStorage.removeItem('notification-kit-persisted')
      setPersistedNotifications([])
    } catch (error) {
      // Failed to clear persisted notifications, continue
    }
  }, [])

  /**
   * Auto-save active notifications
   */
  useEffect(() => {
    if (!hasLoadedPersistenceRef.current) {
      return
    }
    saveNotifications()
  }, [activeNotifications, saveNotifications])

  /**
   * Load on mount
   */
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  return {
    persistedNotifications,
    saveNotifications,
    loadNotifications,
    clearPersistence,
  }
}
