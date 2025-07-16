import { useCallback, useEffect, useRef, useState } from 'react'
import { 
  InAppNotificationManager, 
  type InAppNotificationInstance,
  showInAppNotification,
  dismissInAppNotification,
  dismissAllInAppNotifications,
  getActiveInAppNotifications,
  configureInAppNotifications
} from '@/utils/inApp'
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
  success: (title: string, message?: string, options?: Partial<InAppOptions>) => Promise<string>
  error: (title: string, message?: string, options?: Partial<InAppOptions>) => Promise<string>
  warning: (title: string, message?: string, options?: Partial<InAppOptions>) => Promise<string>
  info: (title: string, message?: string, options?: Partial<InAppOptions>) => Promise<string>
  
  // Dismiss notifications
  dismiss: (id: string) => Promise<void>
  dismissAll: () => Promise<void>
  
  // Utilities
  getActive: () => InAppNotificationInstance[]
  hasActive: boolean
  activeCount: number
  
  // Event handlers
  onShow: (callback: (notification: InAppNotificationInstance) => void) => () => void
  onDismiss: (callback: (id: string) => void) => () => void
}

/**
 * In-app notification hook
 */
export function useInAppNotification(): UseInAppNotificationReturn {
  const [state, setState] = useState<UseInAppNotificationState>({
    activeNotifications: [],
    isConfigured: false,
    config: null
  })

  const managerRef = useRef<InAppNotificationManager | null>(null)
  const showCallbacksRef = useRef<Set<(notification: InAppNotificationInstance) => void>>(new Set())
  const dismissCallbacksRef = useRef<Set<(id: string) => void>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<UseInAppNotificationState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

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
    const active = getActiveInAppNotifications()
    updateState({ activeNotifications: active })
  }, [updateState])

  /**
   * Configure in-app notifications
   */
  const configure = useCallback((config: InAppConfig) => {
    initializeManager()
    configureInAppNotifications(config)
    updateState({ 
      isConfigured: true, 
      config: { ...state.config, ...config } 
    })
  }, [initializeManager, state.config, updateState])

  /**
   * Show notification
   */
  const show = useCallback(async (options: InAppOptions) => {
    initializeManager()
    
    const id = await showInAppNotification(options, state.config || undefined)
    
    // Update active notifications
    updateActiveNotifications()
    
    // Notify show callbacks
    const notification = getActiveInAppNotifications().find(n => n.id === id)
    if (notification) {
      showCallbacksRef.current.forEach(callback => {
        try {
          callback(notification)
        } catch (error) {
          console.error('Error in show callback:', error)
        }
      })
    }
    
    return id
  }, [initializeManager, state.config, updateActiveNotifications])

  /**
   * Show success notification
   */
  const success = useCallback(async (
    title: string, 
    message?: string, 
    options?: Partial<InAppOptions>
  ) => {
    return await show({ title, message: message ?? title, type: 'success', ...options })
  }, [show])

  /**
   * Show error notification
   */
  const error = useCallback(async (
    title: string, 
    message?: string, 
    options?: Partial<InAppOptions>
  ) => {
    return await show({ title, message: message ?? title, type: 'error', ...options })
  }, [show])

  /**
   * Show warning notification
   */
  const warning = useCallback(async (
    title: string, 
    message?: string, 
    options?: Partial<InAppOptions>
  ) => {
    return await show({ title, message: message ?? title, type: 'warning', ...options })
  }, [show])

  /**
   * Show info notification
   */
  const info = useCallback(async (
    title: string, 
    message?: string, 
    options?: Partial<InAppOptions>
  ) => {
    return await show({ title, message: message ?? title, type: 'info', ...options })
  }, [show])

  /**
   * Dismiss notification
   */
  const dismiss = useCallback(async (id: string) => {
    await dismissInAppNotification(id)
    
    // Update active notifications
    updateActiveNotifications()
    
    // Notify dismiss callbacks
    dismissCallbacksRef.current.forEach(callback => {
      try {
        callback(id)
      } catch (error) {
        console.error('Error in dismiss callback:', error)
      }
    })
  }, [updateActiveNotifications])

  /**
   * Dismiss all notifications
   */
  const dismissAll = useCallback(async () => {
    const activeIds = state.activeNotifications.map(n => n.id)
    
    await dismissAllInAppNotifications()
    
    // Update active notifications
    updateActiveNotifications()
    
    // Notify dismiss callbacks for all dismissed notifications
    activeIds.forEach(id => {
      dismissCallbacksRef.current.forEach(callback => {
        try {
          callback(id)
        } catch (error) {
          console.error('Error in dismiss callback:', error)
        }
      })
    })
  }, [state.activeNotifications, updateActiveNotifications])

  /**
   * Get active notifications
   */
  const getActive = useCallback(() => {
    return getActiveInAppNotifications()
  }, [])

  /**
   * Add show callback
   */
  const onShow = useCallback((callback: (notification: InAppNotificationInstance) => void) => {
    showCallbacksRef.current.add(callback)
    
    return () => {
      showCallbacksRef.current.delete(callback)
    }
  }, [])

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
   * Setup active notifications polling
   */
  useEffect(() => {
    // Poll active notifications every 1 second
    intervalRef.current = setInterval(() => {
      updateActiveNotifications()
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [updateActiveNotifications])

  /**
   * Initial active notifications load
   */
  useEffect(() => {
    updateActiveNotifications()
  }, [updateActiveNotifications])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      showCallbacksRef.current.clear()
      dismissCallbacksRef.current.clear()
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
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
    onDismiss
  }
}

/**
 * Simplified hook for basic in-app notifications
 */
export function useInAppNotificationSimple() {
  const { show, success, error, warning, info, dismiss, dismissAll, hasActive, activeCount } = useInAppNotification()
  
  return {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    hasActive,
    activeCount
  }
}

/**
 * Hook for notification queue management
 */
export function useInAppNotificationQueue() {
  const [queue, setQueue] = useState<InAppOptions[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { show, hasActive } = useInAppNotification()

  /**
   * Add to queue
   */
  const enqueue = useCallback((options: InAppOptions) => {
    setQueue(prev => [...prev, options])
  }, [])

  /**
   * Process queue
   */
  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0 || hasActive) {
      return
    }

    setIsProcessing(true)
    
    try {
      const next = queue[0]
      if (next) {
        await show(next)
        setQueue(prev => prev.slice(1))
      }
    } catch (error) {
      console.error('Error processing notification queue:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, queue, hasActive, show])

  /**
   * Clear queue
   */
  const clearQueue = useCallback(() => {
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
    clearQueue
  }
}

/**
 * Hook for notification persistence
 */
export function useInAppNotificationPersistence() {
  const [persistedNotifications, setPersistedNotifications] = useState<InAppNotificationInstance[]>([])
  const { activeNotifications } = useInAppNotification()

  /**
   * Save to persistence
   */
  const saveNotifications = useCallback(() => {
    try {
      const serialized = activeNotifications.map(n => ({
        id: n.id,
        options: n.options,
        timestamp: n.timestamp.toISOString()
      }))
      localStorage.setItem('notification-kit-persisted', JSON.stringify(serialized))
    } catch (error) {
      console.error('Failed to persist notifications:', error)
    }
  }, [activeNotifications])

  /**
   * Load from persistence
   */
  const loadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem('notification-kit-persisted')
      if (stored) {
        const parsed = JSON.parse(stored)
        setPersistedNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })))
      }
    } catch (error) {
      console.error('Failed to load persisted notifications:', error)
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
      console.error('Failed to clear persisted notifications:', error)
    }
  }, [])

  /**
   * Auto-save active notifications
   */
  useEffect(() => {
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
    clearPersistence
  }
}