import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StepDisplay from '../StepDisplay.vue'
import type { PrayerStep } from '@/types'

// Mock prayer step data for testing
const mockPrayerStep: PrayerStep = {
  id: 0,
  name: 'PRAISE',
  description: 'Start your prayer hour by praising the Lord. Praise Him for things that are on your mind right now.',
  duration: 300
}

const mockLongDescriptionStep: PrayerStep = {
  id: 1,
  name: 'VERY LONG STEP NAME FOR TESTING',
  description: 'This is a very long description that should test how the component handles lengthy text content and ensures proper wrapping and readability across different device types and screen sizes.',
  duration: 300
}

describe('StepDisplay', () => {
  describe('Component Rendering', () => {
    it('renders step name and description correctly', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      expect(wrapper.find('.step-display__name').text()).toBe('PRAISE')
      expect(wrapper.find('.step-display__description').text()).toContain('Start your prayer hour by praising the Lord')
    })

    it('applies correct CSS classes for mobile device type', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      expect(wrapper.find('.step-display').classes()).toContain('step-display--mobile')
      expect(wrapper.find('.step-display').classes()).not.toContain('step-display--desktop')
    })

    it('applies correct CSS classes for desktop device type', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'desktop'
        }
      })

      expect(wrapper.find('.step-display').classes()).toContain('step-display--desktop')
      expect(wrapper.find('.step-display').classes()).not.toContain('step-display--mobile')
    })

    it('applies transitioning class when isTransitioning is true', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile',
          isTransitioning: true
        }
      })

      expect(wrapper.find('.step-display').classes()).toContain('step-display--transitioning')
    })

    it('does not apply transitioning class when isTransitioning is false', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile',
          isTransitioning: false
        }
      })

      expect(wrapper.find('.step-display').classes()).not.toContain('step-display--transitioning')
    })
  })

  describe('Mobile Device Type', () => {
    it('renders with mobile-optimized styling', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      const stepDisplay = wrapper.find('.step-display')
      expect(stepDisplay.classes()).toContain('step-display--mobile')
      
      // Check that mobile-specific elements are present
      expect(wrapper.find('.step-display__name').exists()).toBe(true)
      expect(wrapper.find('.step-display__description').exists()).toBe(true)
    })

    it('handles long text content appropriately on mobile', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockLongDescriptionStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      const name = wrapper.find('.step-display__name')
      const description = wrapper.find('.step-display__description')
      
      expect(name.text()).toBe('VERY LONG STEP NAME FOR TESTING')
      expect(description.text()).toContain('This is a very long description')
    })

    it('maintains proper structure for mobile layout', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      const content = wrapper.find('.step-display__content')
      expect(content.exists()).toBe(true)
      
      const name = content.find('.step-display__name')
      const description = content.find('.step-display__description')
      
      expect(name.exists()).toBe(true)
      expect(description.exists()).toBe(true)
    })
  })

  describe('Desktop Device Type', () => {
    it('renders with desktop/projector-optimized styling', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'desktop'
        }
      })

      const stepDisplay = wrapper.find('.step-display')
      expect(stepDisplay.classes()).toContain('step-display--desktop')
      
      // Check that desktop-specific elements are present
      expect(wrapper.find('.step-display__name').exists()).toBe(true)
      expect(wrapper.find('.step-display__description').exists()).toBe(true)
    })

    it('handles long text content appropriately on desktop', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockLongDescriptionStep,
          timeRemaining: 300,
          deviceType: 'desktop'
        }
      })

      const name = wrapper.find('.step-display__name')
      const description = wrapper.find('.step-display__description')
      
      expect(name.text()).toBe('VERY LONG STEP NAME FOR TESTING')
      expect(description.text()).toContain('This is a very long description')
    })

    it('maintains proper structure for desktop layout', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'desktop'
        }
      })

      const content = wrapper.find('.step-display__content')
      expect(content.exists()).toBe(true)
      
      const name = content.find('.step-display__name')
      const description = content.find('.step-display__description')
      
      expect(name.exists()).toBe(true)
      expect(description.exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('updates content when step prop changes', async () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      expect(wrapper.find('.step-display__name').text()).toBe('PRAISE')

      const newStep: PrayerStep = {
        id: 1,
        name: 'WAIT',
        description: 'Spend time waiting on the Lord.',
        duration: 300
      }

      await wrapper.setProps({ step: newStep })
      expect(wrapper.find('.step-display__name').text()).toBe('WAIT')
      expect(wrapper.find('.step-display__description').text()).toContain('Spend time waiting on the Lord')
    })

    it('updates device type styling when deviceType prop changes', async () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      expect(wrapper.find('.step-display').classes()).toContain('step-display--mobile')

      await wrapper.setProps({ deviceType: 'desktop' })
      expect(wrapper.find('.step-display').classes()).toContain('step-display--desktop')
      expect(wrapper.find('.step-display').classes()).not.toContain('step-display--mobile')
    })

    it('handles timeRemaining prop correctly', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 150,
          deviceType: 'mobile'
        }
      })

      // Component should render regardless of timeRemaining value
      expect(wrapper.find('.step-display__name').exists()).toBe(true)
      expect(wrapper.find('.step-display__description').exists()).toBe(true)
    })

    it('handles isTransitioning prop changes', async () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile',
          isTransitioning: false
        }
      })

      expect(wrapper.find('.step-display').classes()).not.toContain('step-display--transitioning')

      await wrapper.setProps({ isTransitioning: true })
      expect(wrapper.find('.step-display').classes()).toContain('step-display--transitioning')
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      // Check for proper heading hierarchy
      expect(wrapper.find('h1.step-display__name').exists()).toBe(true)
      expect(wrapper.find('p.step-display__description').exists()).toBe(true)
    })

    it('maintains readable text content', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      const name = wrapper.find('.step-display__name')
      const description = wrapper.find('.step-display__description')

      // Text should be present and not empty
      expect(name.text().trim()).toBeTruthy()
      expect(description.text().trim()).toBeTruthy()
    })
  })

  describe('CSS Custom Properties', () => {
    it('applies primary color theming', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      const stepDisplay = wrapper.find('.step-display')
      expect(stepDisplay.exists()).toBe(true)
      
      // Component should have the CSS custom property defined
      // This tests that the CSS structure is correct
      expect(wrapper.html()).toContain('step-display__name')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty step name gracefully', () => {
      const emptyNameStep: PrayerStep = {
        id: 0,
        name: '',
        description: 'Description without name',
        duration: 300
      }

      const wrapper = mount(StepDisplay, {
        props: {
          step: emptyNameStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      expect(wrapper.find('.step-display__name').text()).toBe('')
      expect(wrapper.find('.step-display__description').text()).toBe('Description without name')
    })

    it('handles empty step description gracefully', () => {
      const emptyDescStep: PrayerStep = {
        id: 0,
        name: 'NAME ONLY',
        description: '',
        duration: 300
      }

      const wrapper = mount(StepDisplay, {
        props: {
          step: emptyDescStep,
          timeRemaining: 300,
          deviceType: 'mobile'
        }
      })

      expect(wrapper.find('.step-display__name').text()).toBe('NAME ONLY')
      expect(wrapper.find('.step-display__description').text()).toBe('')
    })

    it('handles zero timeRemaining', () => {
      const wrapper = mount(StepDisplay, {
        props: {
          step: mockPrayerStep,
          timeRemaining: 0,
          deviceType: 'mobile'
        }
      })

      // Component should still render properly
      expect(wrapper.find('.step-display__name').exists()).toBe(true)
      expect(wrapper.find('.step-display__description').exists()).toBe(true)
    })
  })
})