<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePrayerCycleStore } from './stores/prayerCycle'
import { usePWA } from './composables/usePWA'
import { useI18n } from './composables/useI18n'
import { TimerService } from './utils/TimerService'
import { audioService } from './utils/AudioService'
import { storageService } from './utils/StorageService'
import { wakeLockService } from './utils/WakeLockService'
import { STEP_DURATION_SECONDS } from './constants/prayerSteps'
import type { UserSettings } from './types'
import StepDisplay from './components/StepDisplay.vue'
import ProgressIndicator from './components/ProgressIndicator.vue'
import TimerControls from './components/TimerControls.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import LanguageSelector from './components/LanguageSelector.vue'

const { t } = useI18n()

// Pinia store connection
const store = usePrayerCycleStore()

// PWA functionality
const { isOnline, isInstallable, installPWA, isPWA } = usePWA()

// Services
const timerService = new TimerService()

// Get step duration from URL parameter or use default
function getStepDuration(): number {
  const urlParams = new URLSearchParams(window.location.search)
  const stepParam = urlParams.get('step')
  
  if (stepParam) {
    const duration = parseInt(stepParam, 10)
    if (!isNaN(duration) && duration > 0) {
      console.log(`Using URL parameter step duration: ${duration} seconds`)
      return duration
    }
  }
  
  return STEP_DURATION_SECONDS
}

// Get the actual step duration to use
const actualStepDuration = getStepDuration()

// Detect device type based on screen size and user agent
function detectDeviceType(): 'mobile' | 'desktop' {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isSmallScreen = window.innerWidth < 768
  return isMobile || isSmallScreen ? 'mobile' : 'desktop'
}

// Device type detection and responsive behavior - initialize with detected type
const deviceType = ref<'mobile' | 'desktop'>(detectDeviceType())

// Update device type on window resize with debouncing to prevent excessive updates
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

function handleResize() {
  // Debounce resize events to prevent excessive updates
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  
  resizeTimeout = setTimeout(() => {
    const newDeviceType = detectDeviceType()
    if (newDeviceType !== deviceType.value) {
      deviceType.value = newDeviceType
      store.updateSettings({ deviceType: newDeviceType })
    }
    resizeTimeout = null
  }, 150) // 150ms debounce
}

// Screen wake lock functionality using the service
async function requestWakeLock() {
  if (store.status === 'active') {
    await wakeLockService.requestWakeLock()
  }
}

function releaseWakeLock() {
  wakeLockService.releaseWakeLock()
}

// Timer management
function handleTimerTick(remaining: number) {
  store.updateTimer(remaining)
}

async function handleTimerComplete() {
  // Play audio notification for step transition
  if (store.settings.audioEnabled) {
    try {
      if (!audioService.isInitialized()) {
        await audioService.initialize()
      }
      await audioService.playNotification()
    } catch (error) {
      console.warn('Failed to play audio notification:', error)
    }
  }
  
  // Advance to next step
  store.completeStep()
  
  // Start timer for next step if not completed
  if (store.status === 'active') {
    startTimer()
  }
}

function startTimer() {
  if (store.timeRemaining > 0) {
    timerService.start(
      store.timeRemaining,
      handleTimerTick,
      handleTimerComplete
    )
  }
}

// Timer control handlers
function handlePlay() {
  if (store.isIdle) {
    store.startCycle()
    startTimer()
    requestWakeLock()
  } else if (store.isPaused) {
    store.resumeTimer()
    timerService.resume(store.timeRemaining)
    requestWakeLock()
  }
  
  // Save session state
  storageService.saveSession({
    currentStep: store.currentStep,
    timeRemaining: store.timeRemaining,
    status: store.status,
    settings: store.settings
  })
}

function handlePause() {
  if (store.isActive) {
    const remaining = timerService.pause()
    store.pauseTimer()
    releaseWakeLock()
    
    // Save paused session state
    storageService.saveSession({
      currentStep: store.currentStep,
      timeRemaining: remaining,
      status: store.status,
      settings: store.settings
    })
  }
}

function handleNext() {
  timerService.stop()
  store.nextStep()
  
  if (store.status === 'active') {
    startTimer()
  } else if (store.isCompleted) {
    releaseWakeLock()
    storageService.clearSession()
  }
}

function handleRestart() {
  timerService.stop()
  store.restartCycle()
  releaseWakeLock()
  storageService.clearSession()
}

function handleSettingsUpdate(newSettings: Partial<UserSettings>) {
  store.updateSettings(newSettings)
  storageService.saveSettings(store.settings)
}

// Computed properties for template
const currentStep = computed(() => store.currentPrayerStep)
const isTransitioning = computed(() => store.status === 'transitioning')

// Watch for status changes to manage wake lock
watch(() => store.status, (newStatus, oldStatus) => {
  if (newStatus === 'active' && oldStatus !== 'active') {
    requestWakeLock()
  } else if (newStatus !== 'active' && oldStatus === 'active') {
    releaseWakeLock()
  }
  
  // Save session state on status changes
  if (newStatus === 'active' || newStatus === 'paused') {
    storageService.saveSession({
      currentStep: store.currentStep,
      timeRemaining: store.timeRemaining,
      status: store.status,
      settings: store.settings
    })
  } else if (newStatus === 'completed' || newStatus === 'idle') {
    storageService.clearSession()
  }
})

// Watch for wake lock setting changes
watch(() => store.settings.wakeLockEnabled, (enabled) => {
  wakeLockService.setEnabled(enabled)
  
  // If enabling and currently active, request wake lock
  if (enabled && store.status === 'active') {
    requestWakeLock()
  }
  
  // Save updated settings
  storageService.saveSettings(store.settings)
})

// Component lifecycle hooks
onMounted(async () => {
  // Set custom step duration from URL parameter
  store.setStepDuration(actualStepDuration)
  
  // Add resize listener for device type detection
  window.addEventListener('resize', handleResize)
  
  // Load settings from storage
  const savedSettings = storageService.loadSettings()
  
  // The deviceType ref is already initialized with detectDeviceType() result
  const currentDetectedType = detectDeviceType()
  
  // For now, always use auto-detection to fix the current issue
  // In the future, we can add a user preference toggle
  deviceType.value = currentDetectedType
  savedSettings.deviceType = currentDetectedType
  
  store.updateSettings(savedSettings)
  
  // Initialize audio service
  try {
    await audioService.initialize()
    audioService.setEnabled(savedSettings.audioEnabled)
  } catch (error) {
    console.warn('Audio service initialization failed:', error)
    // Update settings to reflect audio unavailability
    store.updateSettings({ audioEnabled: false })
  }
  
  // Initialize wake lock service
  wakeLockService.setEnabled(savedSettings.wakeLockEnabled)
  
  // Attempt session recovery
  const savedSession = storageService.loadSession()
  if (savedSession && (savedSession.status === 'active' || savedSession.status === 'paused')) {
    // Restore session state using the store method
    store.restoreSession(savedSession)
    
    // If session was active, start timer
    if (savedSession.status === 'active') {
      startTimer()
      requestWakeLock()
    }
    
    console.log('Prayer session recovered from storage')
  }
  
  // Handle page visibility changes for timer management
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // Cleanup timer service
  timerService.stop()
  
  // Dispose wake lock service
  wakeLockService.dispose()
  
  // Remove event listeners
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  // Dispose audio service
  audioService.dispose()
  
  // Save final session state if in progress
  if (store.status === 'active' || store.status === 'paused') {
    storageService.saveSession({
      currentStep: store.currentStep,
      timeRemaining: store.timeRemaining,
      status: store.status,
      settings: store.settings
    })
  }
})

// Handle page visibility changes (tab switching, minimizing)
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden - save current state
    if (store.status === 'active' || store.status === 'paused') {
      storageService.saveSession({
        currentStep: store.currentStep,
        timeRemaining: store.timeRemaining,
        status: store.status,
        settings: store.settings
      })
    }
  } else {
    // Page is visible again - timer service handles timing compensation automatically
    if (store.status === 'active') {
      requestWakeLock()
    }
    // Let wake lock service handle visibility changes
    wakeLockService.handleVisibilityChange()
  }
}
</script>

<template>
  <!-- Mobile Layout -->
  <div v-if="deviceType === 'mobile'" class="prayer-app-mobile">
    <!-- Offline Status Banner -->
    <div v-if="!isOnline" class="offline-banner">
      <span class="offline-icon">📱</span>
      <span class="offline-text">Offline Mode - All features available</span>
    </div>
    
    <!-- PWA Install Banner -->
    <div v-if="isInstallable && !isPWA" class="install-banner">
      <span class="install-text">Install Prayer Cycle for better experience</span>
      <button @click="installPWA" class="install-btn">Install</button>
    </div>
    
    <!-- Mobile Header -->
    <header class="prayer-header-mobile">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="text-xl font-bold text-primary">{{ t('app.title') }}</h1>
          <LanguageSelector />
          <!-- <SettingsPanel
            :settings="store.settings"
            :device-type="deviceType"
            @update-settings="handleSettingsUpdate"
          /> -->
        </div>
        <TimerControls
          :status="store.status"
          :device-type="deviceType"
          @play="handlePlay"
          @pause="handlePause"
          @next="handleNext"
          @restart="handleRestart"
        />
      </div>
    </header>

    <!-- Mobile Main Content -->
    <main class="prayer-main-mobile">
      <!-- Step Display Section -->
      <section class="prayer-step-section-mobile">
        <StepDisplay 
          :step="currentStep"
          :time-remaining="store.timeRemaining"
          :device-type="deviceType"
          :is-transitioning="isTransitioning"
        />
      </section>

      <!-- Progress Indicator Section -->
      <section class="prayer-progress-section-mobile">
        <ProgressIndicator 
          :current-step="store.stepProgress.current"
          :total-steps="store.stepProgress.total"
          :time-remaining="store.timeRemaining"
          :step-duration="actualStepDuration"
          :device-type="deviceType"
          :is-completed="store.isCompleted"
        />
      </section>


    </main>
  </div>

  <!-- Desktop Layout -->
  <div v-else class="prayer-app-desktop">
    <!-- Offline Status Banner -->
    <div v-if="!isOnline" class="offline-banner desktop">
      <span class="offline-icon">💻</span>
      <span class="offline-text">Offline Mode - All features available</span>
    </div>
    
    <!-- PWA Install Banner -->
    <div v-if="isInstallable && !isPWA" class="install-banner desktop">
      <span class="install-text">Install Prayer Cycle for better experience</span>
      <button @click="installPWA" class="install-btn">Install</button>
    </div>
    
    <!-- Desktop Header -->
    <header class="prayer-header-desktop">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="text-projector-title">{{ t('app.title') }}</h1>
          <LanguageSelector />
          <!-- <SettingsPanel
            :settings="store.settings"
            :device-type="deviceType"
            @update-settings="handleSettingsUpdate"
          /> -->
        </div>
        <TimerControls
          :status="store.status"
          :device-type="deviceType"
          @play="handlePlay"
          @pause="handlePause"
          @next="handleNext"
          @restart="handleRestart"
        />
      </div>
    </header>

    <!-- Desktop Main Content -->
    <main class="prayer-main-desktop">
      <StepDisplay 
        :step="currentStep"
        :time-remaining="store.timeRemaining"
        :device-type="deviceType"
        :is-transitioning="isTransitioning"
      />
    </main>

    <!-- Desktop Sidebar -->
    <aside class="prayer-sidebar-desktop">
      <!-- Progress Section -->
      <section class="flex flex-col items-center">
        <h2 class="text-xl font-semibold text-primary mb-md">{{ t('prayer.progress.total_progress') }}</h2>
        <ProgressIndicator 
          :current-step="store.stepProgress.current"
          :total-steps="store.stepProgress.total"
          :time-remaining="store.timeRemaining"
          :step-duration="actualStepDuration"
          :device-type="deviceType"
          :is-completed="store.isCompleted"
        />
      </section>

    </aside>

  </div>
</template>

<style scoped>
/* Component-specific styles that override the global layout system */

/* Header styles */
.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: var(--spacing-sm);
}

/* Ensure smooth transitions between layouts */
.prayer-app-mobile,
.prayer-app-desktop {
  transition: all 0.3s ease-in-out;
}

/* Mobile-specific adjustments */
.prayer-app-mobile {
  /* Additional mobile-specific styles if needed */
}

/* Desktop-specific adjustments */
.prayer-app-desktop {
  /* Additional desktop-specific styles if needed */
}

/* Responsive adjustments for the demo */
@media (max-width: 767px) {
  .prayer-header-mobile .flex {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .prayer-header-mobile .btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet adjustments for mobile layout */
  .prayer-main-mobile {
    max-width: 800px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  /* Desktop layout is already handled by the CSS grid system */
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .prayer-app-mobile,
  .prayer-app-desktop {
    transition: none;
  }
}

/* PWA Offline and Install Banners */
.offline-banner {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: var(--spacing-xs) var(--spacing-sm);
  text-align: center;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.offline-banner.desktop {
  font-size: 1rem;
  padding: var(--spacing-sm) var(--spacing-md);
}

.offline-icon {
  font-size: 1.2em;
}

.offline-text {
  font-weight: 500;
}

.install-banner {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  text-align: center;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  position: sticky;
  top: 0;
  z-index: 999;
}

.install-banner.desktop {
  font-size: 1rem;
  padding: var(--spacing-sm) var(--spacing-md);
}

.install-text {
  font-weight: 500;
}

.install-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.install-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.install-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .prayer-header-mobile,
  .prayer-header-desktop,
  .prayer-sidebar-desktop,
  .prayer-controls-section-mobile,
  .prayer-controls-desktop {
    border: 2px solid var(--color-text);
  }
  
  .offline-banner {
    border: 2px solid var(--color-text);
    background-color: var(--color-background);
  }
  
  .install-banner {
    border: 2px solid white;
  }
}
</style>
