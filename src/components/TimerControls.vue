<template>
  <div 
    :class="[
      'timer-controls',
      `timer-controls--${deviceType}`,
      { 'timer-controls--disabled': isCompleted }
    ]"
  >
    <!-- Play/Pause Button -->
    <button
      :class="[
        'timer-controls__button',
        'timer-controls__button--primary',
        { 'timer-controls__button--active': isActive }
      ]"
      :disabled="isCompleted"
      :aria-label="playPauseAriaLabel"
      @click="handlePlayPause"
    >
      <svg 
        v-if="!isActive" 
        class="timer-controls__icon" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg 
        v-else 
        class="timer-controls__icon" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
      <span class="timer-controls__label">{{ playPauseLabel }}</span>
    </button>

    <!-- Next Step Button -->
    <button
      :class="[
        'timer-controls__button',
        'timer-controls__button--secondary'
      ]"
      :disabled="isCompleted"
      :aria-label="nextAriaLabel"
      @click="handleNext"
    >
      <svg 
        class="timer-controls__icon" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
      <span class="timer-controls__label">Next</span>
    </button>

    <!-- Restart Button -->
    <button
      :class="[
        'timer-controls__button',
        'timer-controls__button--secondary'
      ]"
      :aria-label="restartAriaLabel"
      @click="handleRestart"
    >
      <svg 
        class="timer-controls__icon" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
      </svg>
      <span class="timer-controls__label">Restart</span>
    </button>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PrayerStatus } from '@/types'

interface Props {
  status: PrayerStatus
  deviceType?: 'mobile' | 'desktop'
}

interface Emits {
  play: []
  pause: []
  next: []
  restart: []
}

const props = withDefaults(defineProps<Props>(), {
  deviceType: 'mobile'
})

const emit = defineEmits<Emits>()

// Computed properties for button states
const isActive = computed(() => props.status === 'active')
const isPaused = computed(() => props.status === 'paused')
const isIdle = computed(() => props.status === 'idle')
const isCompleted = computed(() => props.status === 'completed')
const isTransitioning = computed(() => props.status === 'transitioning')

// Computed properties for button labels and accessibility
const playPauseLabel = computed(() => {
  if (isIdle.value) return 'Start'
  if (isActive.value) return 'Pause'
  if (isPaused.value) return 'Resume'
  if (isCompleted.value) return 'Completed'
  return 'Play'
})

const playPauseAriaLabel = computed(() => {
  if (isIdle.value) return 'Start prayer cycle'
  if (isActive.value) return 'Pause current step'
  if (isPaused.value) return 'Resume current step'
  if (isCompleted.value) return 'Prayer cycle completed'
  return 'Play or pause timer'
})

const nextAriaLabel = computed(() => 
  isCompleted.value ? 'Prayer cycle completed' : 'Skip to next prayer step'
)

const restartAriaLabel = computed(() => 'Restart prayer cycle from beginning')

// Event handlers
function handlePlayPause(): void {
  if (isCompleted.value) return
  
  if (isIdle.value || isPaused.value) {
    emit('play')
  } else if (isActive.value) {
    emit('pause')
  }
}

function handleNext(): void {
  if (isCompleted.value) return
  emit('next')
}

function handleRestart(): void {
  emit('restart')
}
</script>

<style scoped>
.timer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: transparent;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.timer-controls:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.timer-controls--disabled {
  opacity: 0.6;
}

.timer-controls__button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: 0.5rem;
  background: var(--color-primary);
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  
  /* Single line height */
  height: 1.5rem;
  min-height: 1.5rem;
}

.timer-controls__button:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.timer-controls__button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
  background: var(--color-primary-dark);
}

.timer-controls__button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(44, 172, 226, 0.3), var(--shadow-md);
}

.timer-controls__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.timer-controls__button--primary {
  background: var(--color-primary);
  color: var(--color-text-light);
  border-color: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.timer-controls__button--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.timer-controls__button--primary.timer-controls__button--active {
  background: var(--pc-warning);
  color: var(--color-text);
  border-color: #e6a800;
  box-shadow: var(--shadow-md);
}

.timer-controls__button--primary.timer-controls__button--active:hover:not(:disabled) {
  background: #e6a800;
  border-color: #cc9900;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.timer-controls__button--secondary {
  background: var(--color-text-secondary);
  color: var(--color-text-light);
  box-shadow: var(--shadow-sm);
}

.timer-controls__button--secondary:hover:not(:disabled) {
  background: var(--color-text);
  color: var(--color-text-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.timer-controls__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.timer-controls__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-align: center;
}

/* Mobile-specific styles */
.timer-controls--mobile {
  flex-wrap: wrap;
  max-width: 100%;
  padding: var(--spacing-lg) var(--spacing-md);
}

.timer-controls--mobile .timer-controls__button {
  height: 1.75rem;
  min-height: 1.75rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 0.25rem;
}

.timer-controls--mobile .timer-controls__icon {
  width: 18px;
  height: 18px;
}

.timer-controls--mobile .timer-controls__label {
  font-size: var(--font-size-sm);
}

/* Desktop/projector-specific styles */
.timer-controls--desktop {
  flex-direction: row;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.timer-controls--desktop .timer-controls__button {
  height: 2rem;
  min-height: 2rem;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 0.25rem;
  flex-direction: row;
  gap: var(--spacing-sm);
}

.timer-controls--desktop .timer-controls__icon {
  width: 20px;
  height: 20px;
}

.timer-controls--desktop .timer-controls__label {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

/* Responsive breakpoints for mobile */
@media (max-width: 480px) {
  .timer-controls--mobile {
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
  }
  
  .timer-controls--mobile .timer-controls__button {
    height: 1.5rem;
    min-height: 1.5rem;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .timer-controls--mobile .timer-controls__icon {
    width: 16px;
    height: 16px;
  }
  
  .timer-controls--mobile .timer-controls__label {
    font-size: var(--font-size-xs);
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .timer-controls--mobile .timer-controls__button {
    height: 2rem;
    min-height: 2rem;
  }
  
  .timer-controls--mobile .timer-controls__icon {
    width: 18px;
    height: 18px;
  }
  
  .timer-controls--mobile .timer-controls__label {
    font-size: var(--font-size-base);
  }
}

/* Desktop responsive breakpoints */
@media (min-width: 1024px) {
  .timer-controls--desktop .timer-controls__button {
    height: 2.25rem;
    min-height: 2.25rem;
  }
  
  .timer-controls--desktop .timer-controls__icon {
    width: 20px;
    height: 20px;
  }
  
  .timer-controls--desktop .timer-controls__label {
    font-size: var(--font-size-xl);
  }
}

@media (min-width: 1440px) {
  .timer-controls--desktop .timer-controls__button {
    height: 2.5rem;
    min-height: 2.5rem;
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .timer-controls--desktop .timer-controls__icon {
    width: 20px;
    height: 20px;
  }
  
  .timer-controls--desktop .timer-controls__label {
    font-size: var(--font-size-2xl);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .timer-controls,
  .timer-controls__button {
    transition: none;
  }
  
  .timer-controls__button:hover:not(:disabled) {
    transform: none;
  }
  
  .timer-controls__button:active:not(:disabled) {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .timer-controls__button {
    border-width: 3px;
  }
  
  .timer-controls__button--primary {
    border-color: var(--color-primary-dark);
  }
  
  .timer-controls__button--secondary {
    border-color: var(--color-text);
  }
}

/* Focus visible for better keyboard navigation */
.timer-controls__button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
</style>