import type { InAppOptions, InAppConfig } from '@/types'

/**
 * In-app notification management
 */
export class InAppNotificationManager {
  private static instance: InAppNotificationManager | null = null
  private container: HTMLElement | null = null
  private activeNotifications: Map<string, InAppNotificationInstance> =
    new Map()
  private config: InAppConfig = {}

  private constructor() {
    this.createContainer()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): InAppNotificationManager {
    if (!InAppNotificationManager.instance) {
      InAppNotificationManager.instance = new InAppNotificationManager()
    }
    return InAppNotificationManager.instance
  }

  /**
   * Configure in-app notifications
   */
  configure(config: InAppConfig): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Show in-app notification
   */
  async show(options: InAppOptions): Promise<string> {
    const id = this.generateId()
    const notification = this.createNotification(id, options)

    this.activeNotifications.set(id, notification)

    if (this.container) {
      this.container.appendChild(notification.element)

      // Trigger animation
      setTimeout(() => {
        notification.element.classList.add('notification-kit-enter')
      }, 10)
    }

    // Auto-dismiss if duration is set
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, options.duration)
    }

    return id
  }

  /**
   * Dismiss notification
   */
  async dismiss(id: string): Promise<void> {
    const notification = this.activeNotifications.get(id)
    if (!notification) return

    notification.element.classList.add('notification-kit-exit')

    setTimeout(() => {
      if (
        this.container &&
        notification.element.parentNode === this.container
      ) {
        this.container.removeChild(notification.element)
      }
      this.activeNotifications.delete(id)
    }, 300)

    if (notification.options.onDismiss) {
      notification.options.onDismiss()
    }
  }

  /**
   * Dismiss all notifications
   */
  async dismissAll(): Promise<void> {
    const ids = Array.from(this.activeNotifications.keys())
    await Promise.all(ids.map(id => this.dismiss(id)))
  }

  /**
   * Get active notifications
   */
  getActive(): InAppNotificationInstance[] {
    return Array.from(this.activeNotifications.values())
  }

  /**
   * Create notification container
   */
  private createContainer(): void {
    if (typeof window === 'undefined') return

    this.container = document.createElement('div')
    this.container.id = 'notification-kit-container'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `

    document.body.appendChild(this.container)
    this.addStyles()
  }

  /**
   * Create notification element
   */
  private createNotification(
    id: string,
    options: InAppOptions
  ): InAppNotificationInstance {
    const element = document.createElement('div')
    element.id = `notification-kit-${id}`
    element.className = `notification-kit-notification notification-kit-${options.type ?? 'info'} notification-kit-${options.position ?? 'top'}`

    const styles = this.getNotificationStyles(options)
    Object.assign(element.style, styles)

    // Create notification content
    const content = this.createNotificationContent(options)
    element.appendChild(content)

    // Add click handler
    if (options.onAction) {
      element.style.cursor = 'pointer'
      element.addEventListener('click', () => {
        options.onAction!('click')
        if (options.dismissible !== false) {
          this.dismiss(id)
        }
      })
    }

    return {
      id,
      element,
      options,
      timestamp: new Date(),
    }
  }

  /**
   * Create notification content
   */
  private createNotificationContent(options: InAppOptions): HTMLElement {
    const content = document.createElement('div')
    content.className = 'notification-kit-content'
    content.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--notification-kit-bg, #ffffff);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--notification-kit-border, #e0e0e0);
      min-width: 300px;
      max-width: 500px;
      margin: 0 16px;
    `

    // Add icon
    if (options.icon) {
      const icon = document.createElement('div')
      icon.className = 'notification-kit-icon'
      // Only set innerHTML if icon is a string
      if (typeof options.icon === 'string') {
        icon.innerHTML = options.icon
      }
      icon.style.cssText = `
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--notification-kit-icon-color, #666666);
      `
      content.appendChild(icon)
    } else {
      // Add default icon based on type
      const defaultIcon = this.getDefaultIcon(options.type || 'info')
      if (defaultIcon) {
        const icon = document.createElement('div')
        icon.className = 'notification-kit-icon'
        icon.innerHTML = defaultIcon
        icon.style.cssText = `
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--notification-kit-icon-color, ${this.getTypeColor(options.type || 'info')});
        `
        content.appendChild(icon)
      }
    }

    // Add text content
    const textContent = document.createElement('div')
    textContent.className = 'notification-kit-text'
    textContent.style.cssText = `
      flex: 1;
      min-width: 0;
    `

    const title = document.createElement('div')
    title.className = 'notification-kit-title'
    title.textContent = options.title || ''
    title.style.cssText = `
      font-weight: 600;
      font-size: 14px;
      line-height: 1.4;
      color: var(--notification-kit-title-color, #1a1a1a);
      margin-bottom: ${options.message ? '4px' : '0'};
    `
    textContent.appendChild(title)

    if (options.message) {
      const message = document.createElement('div')
      message.className = 'notification-kit-message'
      message.textContent = options.message
      message.style.cssText = `
        font-size: 13px;
        line-height: 1.4;
        color: var(--notification-kit-message-color, #666666);
      `
      textContent.appendChild(message)
    }

    content.appendChild(textContent)

    // Add actions
    if (options.actions && options.actions.length > 0) {
      const actions = document.createElement('div')
      actions.className = 'notification-kit-actions'
      actions.style.cssText = `
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      `

      options.actions.forEach(action => {
        const button = document.createElement('button')
        button.textContent = action.label
        button.style.cssText = `
          padding: 6px 12px;
          border: 1px solid var(--notification-kit-border, #e0e0e0);
          border-radius: 4px;
          background: var(--notification-kit-button-bg, #ffffff);
          color: var(--notification-kit-button-color, #333333);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        `

        button.addEventListener('click', e => {
          e.stopPropagation()
          if (action.onClick) {
            action.onClick()
          }
          if (options.onAction) {
            options.onAction(action.id)
          }
        })

        actions.appendChild(button)
      })

      content.appendChild(actions)
    }

    // Add dismiss button
    if (options.dismissible !== false) {
      const dismissButton = document.createElement('button')
      dismissButton.className = 'notification-kit-dismiss'
      dismissButton.innerHTML = '×'
      dismissButton.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        color: var(--notification-kit-dismiss-color, #999999);
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      `

      dismissButton.addEventListener('click', e => {
        e.stopPropagation()
        const elementId =
          (e.target as HTMLElement).closest('.notification-kit-notification')
            ?.id || ''
        const id = elementId.replace('notification-kit-', '')
        this.dismiss(id)
      })

      content.style.position = 'relative'
      content.appendChild(dismissButton)
    }

    return content
  }

  /**
   * Get notification styles
   */
  private getNotificationStyles(
    options: InAppOptions
  ): Partial<CSSStyleDeclaration> {
    const position = options.position ?? 'top-center'
    const type = options.type ?? 'info'

    const baseStyles: any = {
      position: 'fixed',
      pointerEvents: 'auto',
      transition: 'all 0.3s ease',
      transform: 'translateX(-50%)',
      left: '50%',
      zIndex: '10000',
    }

    // Position styles
    if (position.includes('top')) {
      baseStyles.top = '16px'
    } else if (position.includes('bottom')) {
      baseStyles.bottom = '16px'
    } else if (position === 'center') {
      baseStyles.top = '50%'
      baseStyles.transform = 'translate(-50%, -50%)'
    }

    // Type styles
    const typeColors = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      custom: '#3b82f6',
    }

    const typeColor = typeColors[type] || typeColors.info
    baseStyles['--notification-kit-icon-color'] = typeColor
    baseStyles['--notification-kit-border'] = typeColor

    return baseStyles
  }

  /**
   * Get default icon for type
   */
  private getDefaultIcon(type: string): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    }

    return icons[type as keyof typeof icons] || icons.info
  }

  /**
   * Get type color
   */
  private getTypeColor(type: string): string {
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    }

    return colors[type as keyof typeof colors] || colors.info
  }

  /**
   * Add global styles
   */
  private addStyles(): void {
    if (typeof document === 'undefined') return

    const styleId = 'notification-kit-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .notification-kit-notification {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }

      .notification-kit-notification.notification-kit-enter {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .notification-kit-notification.notification-kit-exit {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }

      .notification-kit-notification.notification-kit-center {
        transform: translate(-50%, -50%) scale(0.9);
      }

      .notification-kit-notification.notification-kit-center.notification-kit-enter {
        transform: translate(-50%, -50%) scale(1);
      }

      .notification-kit-notification.notification-kit-center.notification-kit-exit {
        transform: translate(-50%, -50%) scale(0.9);
      }

      .notification-kit-dismiss:hover {
        color: var(--notification-kit-dismiss-hover-color, #666666) !important;
      }

      .notification-kit-actions button:hover {
        background: var(--notification-kit-button-hover-bg, #f5f5f5) !important;
      }
    `

    document.head.appendChild(style)
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

/**
 * In-app notification instance
 */
export interface InAppNotificationInstance {
  id: string
  element: HTMLElement
  options: InAppOptions
  timestamp: Date
}

/**
 * Show in-app notification
 */
export async function showInAppNotification(
  options: InAppOptions,
  config?: InAppConfig
): Promise<string> {
  const manager = InAppNotificationManager.getInstance()

  if (config) {
    manager.configure(config)
  }

  return await manager.show(options)
}

/**
 * Dismiss in-app notification
 */
export async function dismissInAppNotification(id: string): Promise<void> {
  const manager = InAppNotificationManager.getInstance()
  return await manager.dismiss(id)
}

/**
 * Dismiss all in-app notifications
 */
export async function dismissAllInAppNotifications(): Promise<void> {
  const manager = InAppNotificationManager.getInstance()
  return await manager.dismissAll()
}

/**
 * Get active in-app notifications
 */
export function getActiveInAppNotifications(): InAppNotificationInstance[] {
  const manager = InAppNotificationManager.getInstance()
  return manager.getActive()
}

/**
 * Configure in-app notifications
 */
export function configureInAppNotifications(config: InAppConfig): void {
  const manager = InAppNotificationManager.getInstance()
  manager.configure(config)
}

/**
 * Convenience functions
 */
export const inApp = {
  show: showInAppNotification,
  dismiss: dismissInAppNotification,
  dismissAll: dismissAllInAppNotifications,
  getActive: getActiveInAppNotifications,
  configure: configureInAppNotifications,

  // Type-specific shortcuts
  success: (title: string, message?: string, options?: Partial<InAppOptions>) =>
    showInAppNotification({
      title,
      message: message || title,
      type: 'success',
      ...options,
    }),

  error: (title: string, message?: string, options?: Partial<InAppOptions>) =>
    showInAppNotification({
      title,
      message: message || title,
      type: 'error',
      ...options,
    }),

  warning: (title: string, message?: string, options?: Partial<InAppOptions>) =>
    showInAppNotification({
      title,
      message: message || title,
      type: 'warning',
      ...options,
    }),

  info: (title: string, message?: string, options?: Partial<InAppOptions>) =>
    showInAppNotification({
      title,
      message: message || title,
      type: 'info',
      ...options,
    }),
}
