<template>
  <div class="progress-indicator" :class="deviceClass">
    <!-- Step counter display -->
    <div class="step-counter">
      <span class="step-text">Step {{ safeCurrentStep }} of {{ totalSteps }}</span>
    </div>
    
    <!-- Circular progress visualization -->
    <div class="progress-circle-container">
      <svg class="progress-circle" :width="circleSize" :height="circleSize" :viewBox="`0 0 ${circleSize} ${circleSize}`">
        <!-- Background circle -->
        <circle
          :cx="centerX"
          :cy="centerY"
          :r="radius"
          fill="none"
          stroke="var(--color-background-soft)"
          :stroke-width="strokeWidth"
        />
        
        <!-- Progress circle -->
        <circle
          :cx="centerX"
          :cy="centerY"
          :r="radius"
          fill="none"
          stroke="var(--color-primary)"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          stroke-linecap="round"
          class="progress-stroke"
        />
        
        <!-- Step indicators around the circle -->
        <g class="step-indicators">
          <circle
            v-for="step in totalSteps"
            :key="step"
            :cx="getStepIndicatorX(step - 1)"
            :cy="getStepIndicatorY(step - 1)"
            :r="indicatorRadius"
            :fill="getStepIndicatorColor(step - 1)"
            :stroke="getStepIndicatorStroke(step - 1)"
            :stroke-width="getStepIndicatorStrokeWidth(step - 1)"
            class="step-dot"
          />
        </g>
      </svg>
      
      <!-- Center content showing step info only -->
      <div class="progress-center">
        <span class="current-step-number">{{ safeCurrentStep }}</span>
        <span class="total-steps-text">of {{ totalSteps }}</span>
      </div>
    </div>
    
    <!-- Progress status text -->
    <div class="progress-status">
      <span class="completed-text">{{ completedSteps }} completed</span>
      <span class="remaining-text">{{ remainingSteps }} remaining</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentStep?: number // 1-based step number for display
  totalSteps?: number
  timeRemaining?: number // seconds remaining in current step
  deviceType?: 'mobile' | 'desktop'
  stepDuration?: number // total duration of each step in seconds
}

const props = withDefaults(defineProps<Props>(), {
  currentStep: 1,
  totalSteps: 12,
  timeRemaining: 300,
  deviceType: 'mobile',
  stepDuration: 300
})

// Computed properties for responsive design
const deviceClass = computed(() => `progress-indicator--${props.deviceType}`)

// Ensure currentStep is always within valid bounds (1 to totalSteps)
const safeCurrentStep = computed(() => Math.max(1, Math.min(props.currentStep, props.totalSteps)))

const circleSize = computed(() => props.deviceType === 'desktop' ? 200 : 120)
const radius = computed(() => props.deviceType === 'desktop' ? 85 : 50)
const strokeWidth = computed(() => props.deviceType === 'desktop' ? 8 : 6)
const indicatorRadius = computed(() => props.deviceType === 'desktop' ? 6 : 4)
const indicatorStrokeWidth = computed(() => props.deviceType === 'desktop' ? 2 : 1.5)

// Center coordinates based on circle size
const centerX = computed(() => circleSize.value / 2)
const centerY = computed(() => circleSize.value / 2)

// Circle calculations
const circumference = computed(() => 2 * Math.PI * radius.value)

// Time-based progress calculation (like a clock)
const progressPercentage = computed(() => {
  // Calculate completed steps progress
  const completedSteps = safeCurrentStep.value - 1
  
  // Calculate elapsed time in current step (like a clock's minute hand)
  const elapsedInCurrentStep = props.stepDuration - props.timeRemaining
  const currentStepProgress = elapsedInCurrentStep / props.stepDuration
  
  // Combine completed steps + current step progress for overall cycle progress
  return (completedSteps + currentStepProgress) / props.totalSteps
})

const strokeDashoffset = computed(() => 
  circumference.value - (progressPercentage.value * circumference.value)
)

// Step progress calculations
const completedSteps = computed(() => safeCurrentStep.value - 1)
const remainingSteps = computed(() => props.totalSteps - safeCurrentStep.value)

// Time formatting
const formattedTimeRemaining = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60)
  const seconds = props.timeRemaining % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Step indicator positioning and styling
function getStepIndicatorX(stepIndex: number): number {
  // Position all step indicators evenly around the circle
  // stepIndex 0 should be at the top (12 o'clock)
  // Since the SVG is rotated -90deg, we start at 0 degrees (3 o'clock in normal coords)
  // which becomes 12 o'clock after rotation
  const angle = (stepIndex / props.totalSteps) * 2 * Math.PI
  return centerX.value + radius.value * Math.cos(angle)
}

function getStepIndicatorY(stepIndex: number): number {
  // Position all step indicators evenly around the circle
  // stepIndex 0 should be at the top (12 o'clock)
  const angle = (stepIndex / props.totalSteps) * 2 * Math.PI
  return centerY.value + radius.value * Math.sin(angle)
}

function getStepIndicatorColor(stepIndex: number): string {
  if (stepIndex < safeCurrentStep.value - 1) {
    return 'var(--pc-success)' // Completed steps - green
  } else if (stepIndex === safeCurrentStep.value - 1) {
    return 'var(--color-primary)' // Current step - primary blue
  } else {
    return 'var(--color-background-soft)' // Upcoming steps - light gray
  }
}

function getStepIndicatorStroke(stepIndex: number): string {
  if (stepIndex < safeCurrentStep.value - 1) {
    return '#1e7e34' // Darker green border for completed steps (better contrast)
  } else if (stepIndex === safeCurrentStep.value - 1) {
    return 'var(--color-primary)'
  } else {
    return 'var(--color-text-secondary)'
  }
}

function getStepIndicatorStrokeWidth(stepIndex: number): number {
  if (stepIndex < safeCurrentStep.value - 1) {
    // Thicker border for completed steps to improve visibility
    return props.deviceType === 'desktop' ? 3 : 2.5
  } else {
    // Normal border for current and upcoming steps
    return indicatorStrokeWidth.value
  }
}

</script>

<style scoped>
.progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.step-counter {
  text-align: center;
}

.step-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.progress-circle-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: auto;
}

.progress-circle {
  transform: rotate(-90deg);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  max-width: 100%;
  height: auto;
}

.progress-stroke {
  transition: stroke-dashoffset 0.3s ease-in-out;
}

.step-indicators .step-dot {
  transition: all 0.3s ease-in-out;
}

.progress-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.current-step-number {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.total-steps-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.progress-status {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 200px;
  text-align: center;
  gap: var(--spacing-md);
}

.completed-text,
.remaining-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.completed-text {
  color: var(--pc-success);
}

/* Mobile-specific styles */
.progress-indicator--mobile {
  max-width: 280px;
}

.progress-indicator--mobile .step-text {
  font-size: var(--font-size-base);
}

.progress-indicator--mobile .current-step-number {
  font-size: var(--font-size-xl);
}

.progress-indicator--mobile .total-steps-text {
  font-size: var(--font-size-xs);
}

/* Desktop/projector-specific styles */
.progress-indicator--desktop {
  max-width: 400px;
}

.progress-indicator--desktop .step-text {
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.progress-indicator--desktop .current-step-number {
  font-size: var(--font-size-4xl);
}

.progress-indicator--desktop .total-steps-text {
  font-size: var(--font-size-base);
}

.progress-indicator--desktop .completed-text,
.progress-indicator--desktop .remaining-text {
  font-size: var(--font-size-base);
}

.progress-indicator--desktop .progress-status {
  max-width: 300px;
}

/* Responsive breakpoints */
@media (min-width: 768px) {
  .progress-indicator--mobile .step-text {
    font-size: var(--font-size-xl);
  }
  
  .progress-indicator--mobile .current-step-number {
    font-size: var(--font-size-2xl);
  }
}

@media (min-width: 1024px) {
  .progress-indicator--desktop .step-text {
    font-size: var(--font-size-3xl);
  }
  
  .progress-indicator--desktop .current-step-number {
    font-size: var(--font-size-5xl);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .progress-stroke,
  .step-dot {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .progress-circle {
    filter: none;
  }
  
  .step-dot {
    stroke-width: 2px;
  }
}
</style>