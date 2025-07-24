import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressIndicator from '../ProgressIndicator.vue'

describe('ProgressIndicator', () => {
  describe('Component Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(ProgressIndicator)
      
      expect(wrapper.find('.progress-indicator').exists()).toBe(true)
      expect(wrapper.find('.step-counter').exists()).toBe(true)
      expect(wrapper.find('.progress-circle-container').exists()).toBe(true)
      expect(wrapper.find('.progress-status').exists()).toBe(true)
    })

    it('displays correct step counter text', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 3,
          totalSteps: 12
        }
      })
      
      const stepText = wrapper.find('.step-text')
      expect(stepText.text()).toBe('Step 3 of 12')
    })

    it('displays correct center step number', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 5,
          totalSteps: 12
        }
      })
      
      const currentStepNumber = wrapper.find('.current-step-number')
      const totalStepsText = wrapper.find('.total-steps-text')
      
      expect(currentStepNumber.text()).toBe('5')
      expect(totalStepsText.text()).toBe('of 12')
    })

    it('displays correct progress status', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 4,
          totalSteps: 12
        }
      })
      
      const completedText = wrapper.find('.completed-text')
      const remainingText = wrapper.find('.remaining-text')
      
      expect(completedText.text()).toBe('3 completed')
      expect(remainingText.text()).toBe('8 remaining')
    })
  })

  describe('Device Type Responsive Design', () => {
    it('applies mobile device class by default', () => {
      const wrapper = mount(ProgressIndicator)
      
      expect(wrapper.find('.progress-indicator--mobile').exists()).toBe(true)
      expect(wrapper.find('.progress-indicator--desktop').exists()).toBe(false)
    })

    it('applies desktop device class when specified', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          deviceType: 'desktop'
        }
      })
      
      expect(wrapper.find('.progress-indicator--desktop').exists()).toBe(true)
      expect(wrapper.find('.progress-indicator--mobile').exists()).toBe(false)
    })

    it('renders different circle sizes for mobile vs desktop', () => {
      const mobileWrapper = mount(ProgressIndicator, {
        props: { deviceType: 'mobile' }
      })
      const desktopWrapper = mount(ProgressIndicator, {
        props: { deviceType: 'desktop' }
      })
      
      const mobileCircle = mobileWrapper.find('.progress-circle')
      const desktopCircle = desktopWrapper.find('.progress-circle')
      
      expect(mobileCircle.attributes('width')).toBe('120')
      expect(mobileCircle.attributes('height')).toBe('120')
      expect(desktopCircle.attributes('width')).toBe('200')
      expect(desktopCircle.attributes('height')).toBe('200')
    })
  })

  describe('SVG Circle Progress Visualization', () => {
    it('renders background and progress circles', () => {
      const wrapper = mount(ProgressIndicator)
      
      const circles = wrapper.findAll('circle')
      expect(circles.length).toBeGreaterThanOrEqual(2) // Background + progress + step indicators
      
      // Check background circle
      const backgroundCircle = circles[0]
      expect(backgroundCircle.attributes('fill')).toBe('none')
      expect(backgroundCircle.attributes('stroke')).toBe('var(--color-background-soft)')
      
      // Check progress circle
      const progressCircle = circles[1]
      expect(progressCircle.attributes('fill')).toBe('none')
      expect(progressCircle.attributes('stroke')).toBe('var(--color-primary)')
      expect(progressCircle.attributes('stroke-linecap')).toBe('round')
    })

    it('calculates correct stroke-dashoffset for progress', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 6,
          totalSteps: 12
        }
      })
      
      const progressCircle = wrapper.findAll('circle')[1]
      const strokeDasharray = progressCircle.attributes('stroke-dasharray')
      const strokeDashoffset = progressCircle.attributes('stroke-dashoffset')
      
      expect(strokeDasharray).toBeDefined()
      expect(strokeDashoffset).toBeDefined()
      
      // For step 6 of 12, progress should be 5/12 = ~41.67%
      const circumference = parseFloat(strokeDasharray!)
      const offset = parseFloat(strokeDashoffset!)
      const progressPercentage = (circumference - offset) / circumference
      
      expect(progressPercentage).toBeCloseTo(5/12, 2)
    })

    it('renders correct number of step indicator dots', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 3,
          totalSteps: 12
        }
      })
      
      const stepDots = wrapper.findAll('.step-dot')
      expect(stepDots.length).toBe(12)
    })
  })

  describe('Step Indicator Visual States', () => {
    it('shows completed steps in success color', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 4,
          totalSteps: 12
        }
      })
      
      const stepDots = wrapper.findAll('.step-dot')
      
      // First 3 steps should be completed (success color)
      for (let i = 0; i < 3; i++) {
        expect(stepDots[i].attributes('fill')).toBe('var(--pc-success)')
        expect(stepDots[i].attributes('stroke')).toBe('#1e7e34') // Darker green border for better contrast
      }
    })

    it('shows current step in primary color', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 4,
          totalSteps: 12
        }
      })
      
      const stepDots = wrapper.findAll('.step-dot')
      
      // 4th step (index 3) should be current (primary color)
      expect(stepDots[3].attributes('fill')).toBe('var(--color-primary)')
      expect(stepDots[3].attributes('stroke')).toBe('var(--color-primary)')
    })

    it('shows upcoming steps in light color', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 4,
          totalSteps: 12
        }
      })
      
      const stepDots = wrapper.findAll('.step-dot')
      
      // Steps 5-12 (indices 4-11) should be upcoming (light color)
      for (let i = 4; i < 12; i++) {
        expect(stepDots[i].attributes('fill')).toBe('var(--color-background-soft)')
        expect(stepDots[i].attributes('stroke')).toBe('var(--color-text-secondary)')
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles first step correctly', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 1,
          totalSteps: 12
        }
      })
      
      expect(wrapper.find('.step-text').text()).toBe('Step 1 of 12')
      expect(wrapper.find('.completed-text').text()).toBe('0 completed')
      expect(wrapper.find('.remaining-text').text()).toBe('11 remaining')
      
      const stepDots = wrapper.findAll('.step-dot')
      expect(stepDots[0].attributes('fill')).toBe('var(--color-primary)') // Current
      expect(stepDots[1].attributes('fill')).toBe('var(--color-background-soft)') // Upcoming
    })

    it('handles last step correctly', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 12,
          totalSteps: 12
        }
      })
      
      expect(wrapper.find('.step-text').text()).toBe('Step 12 of 12')
      expect(wrapper.find('.completed-text').text()).toBe('11 completed')
      expect(wrapper.find('.remaining-text').text()).toBe('0 remaining')
      
      const stepDots = wrapper.findAll('.step-dot')
      expect(stepDots[11].attributes('fill')).toBe('var(--color-primary)') // Current (last)
      expect(stepDots[10].attributes('fill')).toBe('var(--pc-success)') // Completed
    })

    it('handles single step cycle', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 1,
          totalSteps: 1
        }
      })
      
      expect(wrapper.find('.step-text').text()).toBe('Step 1 of 1')
      expect(wrapper.find('.completed-text').text()).toBe('0 completed')
      expect(wrapper.find('.remaining-text').text()).toBe('0 remaining')
      
      const stepDots = wrapper.findAll('.step-dot')
      expect(stepDots.length).toBe(1)
      expect(stepDots[0].attributes('fill')).toBe('var(--color-primary)')
    })
  })

  describe('Accessibility', () => {
    it('provides semantic structure with proper text content', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 5,
          totalSteps: 12
        }
      })
      
      // Check that all text content is accessible
      expect(wrapper.text()).toContain('Step 5 of 12')
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('of 12')
      expect(wrapper.text()).toContain('4 completed')
      expect(wrapper.text()).toContain('7 remaining')
    })

    it('maintains proper contrast with CSS custom properties', () => {
      const wrapper = mount(ProgressIndicator)
      
      // Verify that color values use CSS custom properties for theming
      const progressCircle = wrapper.findAll('circle')[1]
      expect(progressCircle.attributes('stroke')).toBe('var(--color-primary)')
      
      const stepText = wrapper.find('.step-text')
      expect(stepText.classes()).not.toContain('text-primary') // Uses default text color
    })
  })

  describe('Requirements Validation', () => {
    it('satisfies requirement 2.1: displays visual progress indicator', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 6,
          totalSteps: 12
        }
      })
      
      // Should show circular progress visualization
      expect(wrapper.find('.progress-circle').exists()).toBe(true)
      expect(wrapper.find('.progress-stroke').exists()).toBe(true)
      
      // Should show current position in 12-step cycle
      const stepDots = wrapper.findAll('.step-dot')
      expect(stepDots.length).toBe(12)
    })

    it('satisfies requirement 2.2: shows step number', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 7,
          totalSteps: 12
        }
      })
      
      // Should display which step number is currently active
      expect(wrapper.find('.step-text').text()).toBe('Step 7 of 12')
      expect(wrapper.find('.current-step-number').text()).toBe('7')
    })

    it('satisfies requirement 2.3: indicates completed and upcoming steps', () => {
      const wrapper = mount(ProgressIndicator, {
        props: {
          currentStep: 5,
          totalSteps: 12
        }
      })
      
      // Should indicate completed, current, and upcoming steps
      expect(wrapper.find('.completed-text').text()).toBe('4 completed')
      expect(wrapper.find('.remaining-text').text()).toBe('7 remaining')
      
      const stepDots = wrapper.findAll('.step-dot')
      // Completed steps (0-3) should have success color
      expect(stepDots[3].attributes('fill')).toBe('var(--pc-success)')
      // Current step (4) should have primary color
      expect(stepDots[4].attributes('fill')).toBe('var(--color-primary)')
      // Upcoming steps (5+) should have light color
      expect(stepDots[5].attributes('fill')).toBe('var(--color-background-soft)')
    })

    it('satisfies requirement 2.4: implements responsive sizing', () => {
      const mobileWrapper = mount(ProgressIndicator, {
        props: { deviceType: 'mobile' }
      })
      const desktopWrapper = mount(ProgressIndicator, {
        props: { deviceType: 'desktop' }
      })
      
      // Should have different sizing for mobile and desktop
      expect(mobileWrapper.find('.progress-indicator--mobile').exists()).toBe(true)
      expect(desktopWrapper.find('.progress-indicator--desktop').exists()).toBe(true)
      
      // Circle sizes should be different
      const mobileCircle = mobileWrapper.find('.progress-circle')
      const desktopCircle = desktopWrapper.find('.progress-circle')
      expect(mobileCircle.attributes('width')).toBe('120')
      expect(desktopCircle.attributes('width')).toBe('200')
    })
  })
})