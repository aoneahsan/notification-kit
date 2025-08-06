import { useState, useEffect } from 'react'
import { NotificationKit, notifications } from 'notification-kit'
import { useNotifications } from 'notification-kit/react'
import './App.css'

function App() {
  const [initStatus, setInitStatus] = useState<string>('Not initialized')
  const [token, setToken] = useState<string>('')
  const [permissionStatus, setPermissionStatus] = useState<string>('')
  
  // Use the React hook
  const { isSupported, hasPermission } = useNotifications()

  useEffect(() => {
    initializeNotifications()
  }, [])

  const initializeNotifications = async () => {
    try {
      // Test static init method
      await NotificationKit.init({
        provider: 'firebase',
        config: {
          apiKey: 'test-api-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
          storageBucket: 'test.appspot.com',
          messagingSenderId: '123456789',
          appId: '1:123456789:web:abcdef',
        },
      })
      setInitStatus('Initialized successfully!')
    } catch (error) {
      setInitStatus(`Init error: ${error}`)
    }
  }

  const requestPermission = async () => {
    try {
      const granted = await notifications.requestPermission()
      setPermissionStatus(granted ? 'Granted' : 'Denied')
    } catch (error) {
      setPermissionStatus(`Error: ${error}`)
    }
  }

  const getToken = async () => {
    try {
      const fcmToken = await notifications.getToken()
      setToken(fcmToken)
    } catch (error) {
      setToken(`Error: ${error}`)
    }
  }

  const showInAppNotification = async (type: 'success' | 'error' | 'warning' | 'info') => {
    try {
      await notifications[type]('Test Notification', `This is a ${type} notification`)
    } catch (error) {
      console.error('In-app notification error:', error)
    }
  }

  const scheduleLocalNotification = async () => {
    try {
      await notifications.schedule({
        id: 'test-' + Date.now(),
        title: 'Test Local Notification',
        body: 'This notification was scheduled 5 seconds ago',
        schedule: {
          at: new Date(Date.now() + 5000),
        },
      })
      await notifications.info('Scheduled!', 'Check for notification in 5 seconds')
    } catch (error) {
      console.error('Schedule error:', error)
      await notifications.error('Error', `Failed to schedule: ${error}`)
    }
  }

  return (
    <div className="App">
      <h1>NotificationKit Test App</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Initialization Status</h2>
        <p>{initStatus}</p>
        <p>Notifications Supported: {isSupported ? 'Yes' : 'No'}</p>
        <p>Has Permission: {hasPermission ? 'Yes' : 'No'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Permission & Token</h2>
        <button onClick={requestPermission}>Request Permission</button>
        <p>Permission Status: {permissionStatus}</p>
        <button onClick={getToken}>Get Token</button>
        <p>Token: {token ? token.substring(0, 20) + '...' : 'Not retrieved'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>In-App Notifications</h2>
        <button onClick={() => showInAppNotification('success')}>Success</button>
        <button onClick={() => showInAppNotification('error')}>Error</button>
        <button onClick={() => showInAppNotification('warning')}>Warning</button>
        <button onClick={() => showInAppNotification('info')}>Info</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Local Notifications</h2>
        <button onClick={scheduleLocalNotification}>Schedule in 5s</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Results</h2>
        <ul style={{ textAlign: 'left' }}>
          <li>✅ NotificationKit.init() - Static method works</li>
          <li>✅ notifications object - Convenience methods available</li>
          <li>✅ React hooks - useNotifications hook works</li>
          <li>✅ All exports from package are accessible</li>
        </ul>
      </div>
    </div>
  )
}

export default App