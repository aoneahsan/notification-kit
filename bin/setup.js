#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import { exec as execCallback } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execCallback)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

const PROVIDERS = {
  firebase: {
    name: 'Firebase Cloud Messaging',
    package: 'firebase',
    configKeys: ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId']
  },
  onesignal: {
    name: 'OneSignal',
    package: 'react-onesignal',
    configKeys: ['appId', 'safariWebId', 'restApiKey']
  }
}

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

function logHeader(message) {
  console.log()
  log(`=== ${message} ===`, 'bright')
  console.log()
}

async function detectFramework() {
  try {
    const packageJson = await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8')
    const pkg = JSON.parse(packageJson)
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    
    if (deps.react) {
      return 'react'
    } else if (deps.vue) {
      return 'vue'
    } else if (deps['@angular/core']) {
      return 'angular'
    }
  } catch (error) {
    // Ignore error
  }
  return null
}

async function detectCapacitor() {
  try {
    const packageJson = await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8')
    const pkg = JSON.parse(packageJson)
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    
    return !!(deps['@capacitor/core'])
  } catch (error) {
    return false
  }
}

async function installPackages(packages) {
  logHeader('Installing Dependencies')
  
  const packageManager = await detectPackageManager()
  const installCmd = packageManager === 'yarn' ? 'yarn add' : 'npm install'
  
  log(`Using ${packageManager} to install packages...`, 'cyan')
  
  try {
    const cmd = `${installCmd} ${packages.join(' ')}`
    log(`Running: ${cmd}`, 'yellow')
    
    const { stdout, stderr } = await exec(cmd)
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    
    log('✓ Dependencies installed successfully!', 'green')
  } catch (error) {
    log('✗ Failed to install dependencies', 'red')
    console.error(error)
    process.exit(1)
  }
}

async function detectPackageManager() {
  try {
    await fs.access(path.join(process.cwd(), 'yarn.lock'))
    return 'yarn'
  } catch {
    return 'npm'
  }
}

async function createConfigFile(provider, config) {
  logHeader('Creating Configuration File')
  
  const configContent = `import { NotificationKit } from 'notification-kit'

// Initialize notification-kit with ${PROVIDERS[provider].name}
NotificationKit.init({
  provider: '${provider}',
  config: ${JSON.stringify(config, null, 2).replace(/"([^"]+)":/g, '$1:')},
  inApp: {
    position: 'top-center',
    duration: 5000,
    theme: {
      primary: '#3B82F6',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    }
  }
})

export { notifications } from 'notification-kit'
`

  const configPath = path.join(process.cwd(), 'src', 'config', 'notifications.js')
  await fs.mkdir(path.dirname(configPath), { recursive: true })
  await fs.writeFile(configPath, configContent)
  
  log(`✓ Configuration file created at: ${configPath}`, 'green')
  
  return configPath
}

async function updateCapacitorConfig() {
  logHeader('Updating Capacitor Configuration')
  
  const capacitorConfigPath = path.join(process.cwd(), 'capacitor.config.json')
  
  try {
    const configContent = await fs.readFile(capacitorConfigPath, 'utf8')
    const config = JSON.parse(configContent)
    
    // Add push notifications plugin if not present
    if (!config.plugins) {
      config.plugins = {}
    }
    
    if (!config.plugins.PushNotifications) {
      config.plugins.PushNotifications = {
        presentationOptions: ['badge', 'sound', 'alert']
      }
    }
    
    await fs.writeFile(capacitorConfigPath, JSON.stringify(config, null, 2))
    log('✓ Updated capacitor.config.json', 'green')
  } catch (error) {
    log('⚠ Could not update capacitor.config.json - please update manually', 'yellow')
  }
}

async function showPlatformInstructions(provider) {
  logHeader('Platform-Specific Setup')
  
  log('iOS Setup:', 'cyan')
  console.log('1. Open your iOS project in Xcode')
  console.log('2. Add Push Notifications capability')
  console.log('3. Enable Background Modes > Remote notifications')
  
  if (provider === 'firebase') {
    console.log('4. Add GoogleService-Info.plist to your iOS project')
  }
  
  console.log()
  
  log('Android Setup:', 'cyan')
  if (provider === 'firebase') {
    console.log('1. Add google-services.json to android/app/')
    console.log('2. Ensure Firebase gradle plugin is configured')
  } else {
    console.log('1. Configure OneSignal in your Android project')
  }
  
  console.log()
  
  log('Web Setup:', 'cyan')
  console.log('1. Add service worker for push notifications')
  console.log('2. Serve your app over HTTPS (required for push)')
}

async function createExampleUsage(framework, configPath) {
  logHeader('Example Usage')
  
  if (framework === 'react') {
    const exampleContent = `import { useNotifications } from 'notification-kit/react'
import { notifications } from '${path.relative(path.join(process.cwd(), 'src'), configPath).replace('.js', '')}'

function MyComponent() {
  const { 
    permission, 
    requestPermission, 
    isSupported,
    showInApp 
  } = useNotifications()

  const handleNotification = async () => {
    // Request permission if needed
    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return
    }

    // Show in-app notification
    showInApp.success('Notification sent successfully!')
    
    // Schedule a local notification
    await notifications.schedule({
      title: 'Reminder',
      body: 'This is a scheduled notification',
      at: new Date(Date.now() + 60000) // 1 minute from now
    })
  }

  return (
    <div>
      <button onClick={handleNotification}>
        Send Notification
      </button>
    </div>
  )
}
`
    
    const examplePath = path.join(process.cwd(), 'src', 'examples', 'NotificationExample.jsx')
    await fs.mkdir(path.dirname(examplePath), { recursive: true })
    await fs.writeFile(examplePath, exampleContent)
    
    log(`✓ Example component created at: ${examplePath}`, 'green')
  }
}

async function deployServiceWorker(provider) {
  logHeader('Service Worker Setup')

  const templates = {
    firebase: {
      src: 'firebase-messaging-sw.template.js',
      dest: 'firebase-messaging-sw.js'
    },
    onesignal: {
      src: 'onesignal-sw.template.js',
      dest: 'OneSignalSDKWorker.js'
    }
  }

  const tpl = templates[provider]
  if (!tpl) {
    return
  }

  // Templates are shipped alongside this CLI at <pkg>/dist/templates.
  const srcPath = path.join(__dirname, '..', 'dist', 'templates', tpl.src)
  const publicDir = path.join(process.cwd(), 'public')
  const destPath = path.join(publicDir, tpl.dest)

  try {
    await fs.access(srcPath)
  } catch {
    log(`⚠ Service worker template "${tpl.src}" not found; skipping.`, 'yellow')
    return
  }

  try {
    await fs.mkdir(publicDir, { recursive: true })

    let shouldWrite = true
    try {
      await fs.access(destPath)
      const answer = await question(
        `${tpl.dest} already exists in public/. Overwrite? (y/n): `
      )
      shouldWrite = answer.toLowerCase() === 'y'
    } catch {
      // Destination does not exist yet — safe to write.
    }

    if (shouldWrite) {
      await fs.copyFile(srcPath, destPath)
      log(`✓ Service worker written to: ${destPath}`, 'green')
      log('  (web push requires this file served from your site root)', 'cyan')
    } else {
      log('Skipped service worker (kept existing file).', 'yellow')
    }
  } catch (error) {
    log(`⚠ Could not write service worker: ${error.message}`, 'red')
  }
}

async function main() {
  log('🔔 Welcome to notification-kit setup!', 'bright')
  console.log()
  
  // Detect environment
  const framework = await detectFramework()
  const hasCapacitor = await detectCapacitor()
  
  if (framework) {
    log(`Detected framework: ${framework}`, 'green')
  }
  
  if (hasCapacitor) {
    log('Detected Capacitor project', 'green')
  } else {
    log('⚠ Capacitor not detected - some features may not work', 'yellow')
  }
  
  // Choose provider
  logHeader('Provider Selection')
  console.log('Which notification provider would you like to use?')
  console.log('1. Firebase Cloud Messaging')
  console.log('2. OneSignal')
  console.log()
  
  const providerChoice = await question('Enter your choice (1 or 2): ')
  const provider = providerChoice === '2' ? 'onesignal' : 'firebase'
  
  log(`\nSelected: ${PROVIDERS[provider].name}`, 'cyan')
  
  // Collect configuration
  logHeader('Provider Configuration')
  const config = {}
  
  for (const key of PROVIDERS[provider].configKeys) {
    const value = await question(`Enter ${key}: `)
    if (value) {
      config[key] = value
    }
  }
  
  // Install packages
  const packages = ['notification-kit']
  
  if (!hasCapacitor) {
    const installCapacitor = await question('\nWould you like to install Capacitor? (y/n): ')
    if (installCapacitor.toLowerCase() === 'y') {
      packages.push('@capacitor/core', '@capacitor/push-notifications', '@capacitor/local-notifications', '@capacitor/preferences')
    }
  }
  
  await installPackages(packages)
  
  // Create configuration
  const configPath = await createConfigFile(provider, config)
  
  // Update Capacitor config if present
  if (hasCapacitor) {
    await updateCapacitorConfig()
  }
  
  // Deploy the web push service worker into public/
  await deployServiceWorker(provider)

  // Show platform instructions
  await showPlatformInstructions(provider)
  
  // Create example usage
  if (framework) {
    await createExampleUsage(framework, configPath)
  }
  
  // Final instructions
  logHeader('Setup Complete!')
  
  log('✓ notification-kit has been configured successfully!', 'green')
  console.log()
  log('Next steps:', 'cyan')
  console.log('1. Complete platform-specific setup as shown above')
  console.log('2. Import and use notifications in your app')
  console.log('3. Test on device/emulator for best results')
  console.log()
  log('For more information, visit: https://github.com/aoneahsan/notification-kit', 'blue')
  
  rl.close()
}

main().catch(error => {
  console.error('Setup failed:', error)
  process.exit(1)
})