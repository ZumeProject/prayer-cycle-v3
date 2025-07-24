<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePrayerCycleStore } from './stores/prayerCycle'
import { TimerService } from './utils/TimerService'
import { audioService } from './utils/AudioService'
import { storageService } from './utils/StorageService'
import { STEP_DURATION_SECONDS } from './constants/prayerSteps'
import StepDisplay from './components/StepDisplay.vue'
import ProgressIndicator from './components/ProgressIndicator.vue'
import TimerControls from './components/TimerControls.vue'

// Pinia store connection
const store = usePrayerCycleStore()

// Services
const timerService = new TimerService()

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

// Screen wake lock functionality
let wakeLock: any = null

async function requestWakeLock() {
  if ('wakeLock' in navigator && store.status === 'active') {
    try {
      wakeLock = await (navigator as any).wakeLock.request('screen')
      console.log('Screen wake lock activated')
    } catch (error) {
      console.warn('Failed to activate screen wake lock:', error)
    }
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release()
    wakeLock = null
    console.log('Screen wake lock released')
  }
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

// Component lifecycle hooks
onMounted(async () => {
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
  
  // Release wake lock
  releaseWakeLock()
  
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
  }
}
</script>

<template>
  <!-- Mobile Layout -->
  <div v-if="deviceType === 'mobile'" class="prayer-app-mobile">
    <!-- Mobile Header -->
    <header class="prayer-header-mobile">
      <div class="header-content">
        <h1 class="text-xl font-bold text-primary">Prayer Cycle</h1>
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
          :step-duration="STEP_DURATION_SECONDS"
          :device-type="deviceType"
        />
      </section>


    </main>
  </div>

  <!-- Desktop Layout -->
  <div v-else class="prayer-app-desktop">
    <!-- Desktop Header -->
    <header class="prayer-header-desktop">
      <div class="header-content">
        <h1 class="text-projector-title">Prayer Cycle</h1>
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
        <h2 class="text-xl font-semibold text-primary mb-md">Progress</h2>
        <ProgressIndicator 
          :current-step="store.stepProgress.current"
          :total-steps="store.stepProgress.total"
          :time-remaining="store.timeRemaining"
          :step-duration="STEP_DURATION_SECONDS"
          :device-type="deviceType"
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

/* High contrast mode support */
@media (prefers-contrast: high) {
  .prayer-header-mobile,
  .prayer-header-desktop,
  .prayer-sidebar-desktop,
  .prayer-controls-section-mobile,
  .prayer-controls-desktop {
    border: 2px solid var(--color-text);
  }
}
</style>
