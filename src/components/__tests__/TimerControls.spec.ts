import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TimerControls from '../TimerControls.vue'
import type { PrayerStatus } from '@/types'

describe('TimerControls', () => {
  let wrapper: any

  beforeEach(() => {
    // Mock global addEventListener/removeEventListener
    vi.spyOn(document, 'addEventListener')
    vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders with default mobile props', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus
        }
      })

      expect(wrapper.find('.timer-controls').exists()).toBe(true)
      expect(wrapper.find('.timer-controls--mobile').exists()).toBe(true)
      expect(wrapper.find('.timer-controls--desktop').exists()).toBe(false)
    })

    it('renders with desktop device type', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      expect(wrapper.find('.timer-controls--desktop').exists()).toBe(true)
      expect(wrapper.find('.timer-controls--mobile').exists()).toBe(false)
      expect(wrapper.find('.timer-controls__shortcuts').exists()).toBe(true)
    })

    it('renders all control buttons', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus
        }
      })

      const buttons = wrapper.findAll('.timer-controls__button')
      expect(buttons).toHaveLength(3)
      
      // Check button labels
      const labels = buttons.map((btn: any) => btn.find('.timer-controls__label').text())
      expect(labels).toContain('Start')
      expect(labels).toContain('Next')
      expect(labels).toContain('Restart')
    })
  })

  describe('Button States and Labels', () => {
    it('shows correct play/pause button label for idle status', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      expect(playButton.find('.timer-controls__label').text()).toBe('Start')
      expect(playButton.attributes('aria-label')).toBe('Start prayer cycle')
    })

    it('shows correct play/pause button label for active status', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      expect(playButton.find('.timer-controls__label').text()).toBe('Pause')
      expect(playButton.attributes('aria-label')).toBe('Pause current step')
      expect(playButton.classes()).toContain('timer-controls__button--active')
    })

    it('shows correct play/pause button label for paused status', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'paused' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      expect(playButton.find('.timer-controls__label').text()).toBe('Resume')
      expect(playButton.attributes('aria-label')).toBe('Resume current step')
    })

    it('shows correct play/pause button label for completed status', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'completed' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      expect(playButton.find('.timer-controls__label').text()).toBe('Completed')
      expect(playButton.attributes('aria-label')).toBe('Prayer cycle completed')
      expect(playButton.attributes('disabled')).toBeDefined()
    })

    it('disables buttons when status is completed', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'completed' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      const nextButton = wrapper.findAll('.timer-controls__button--secondary')[0]
      
      expect(playButton.attributes('disabled')).toBeDefined()
      expect(nextButton.attributes('disabled')).toBeDefined()
      expect(wrapper.find('.timer-controls--disabled').exists()).toBe(true)
    })
  })

  describe('Event Emission', () => {
    it('emits play event when clicking start button in idle state', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      await playButton.trigger('click')

      expect(wrapper.emitted('play')).toHaveLength(1)
    })

    it('emits play event when clicking resume button in paused state', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'paused' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      await playButton.trigger('click')

      expect(wrapper.emitted('play')).toHaveLength(1)
    })

    it('emits pause event when clicking pause button in active state', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      await playButton.trigger('click')

      expect(wrapper.emitted('pause')).toHaveLength(1)
    })

    it('emits next event when clicking next button', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus
        }
      })

      const nextButton = wrapper.findAll('.timer-controls__button--secondary')[0]
      await nextButton.trigger('click')

      expect(wrapper.emitted('next')).toHaveLength(1)
    })

    it('emits restart event when clicking restart button', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus
        }
      })

      const restartButton = wrapper.findAll('.timer-controls__button--secondary')[1]
      await restartButton.trigger('click')

      expect(wrapper.emitted('restart')).toHaveLength(1)
    })

    it('does not emit events when buttons are disabled', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'completed' as PrayerStatus
        }
      })

      const playButton = wrapper.find('.timer-controls__button--primary')
      const nextButton = wrapper.findAll('.timer-controls__button--secondary')[0]
      
      await playButton.trigger('click')
      await nextButton.trigger('click')

      expect(wrapper.emitted('play')).toBeFalsy()
      expect(wrapper.emitted('next')).toBeFalsy()
    })
  })

  describe('Keyboard Shortcuts (Desktop)', () => {
    it('sets up global keyboard listener on desktop mount', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('removes global keyboard listener on desktop unmount', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      wrapper.unmount()

      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('does not set up keyboard listener on mobile', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'mobile'
        }
      })

      expect(document.addEventListener).not.toHaveBeenCalled()
    })

    it('handles spacebar key for play/pause', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      const controlsElement = wrapper.find('.timer-controls')
      await controlsElement.trigger('keydown', { key: ' ' })

      expect(wrapper.emitted('play')).toHaveLength(1)
    })

    it('handles "n" key for next step', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      const controlsElement = wrapper.find('.timer-controls')
      await controlsElement.trigger('keydown', { key: 'n' })

      expect(wrapper.emitted('next')).toHaveLength(1)
    })

    it('handles "r" key for restart', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      const controlsElement = wrapper.find('.timer-controls')
      await controlsElement.trigger('keydown', { key: 'r' })

      expect(wrapper.emitted('restart')).toHaveLength(1)
    })

    it('handles uppercase keyboard shortcuts', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      const controlsElement = wrapper.find('.timer-controls')
      
      await controlsElement.trigger('keydown', { key: 'N' })
      expect(wrapper.emitted('next')).toHaveLength(1)
      
      await controlsElement.trigger('keydown', { key: 'R' })
      expect(wrapper.emitted('restart')).toHaveLength(1)
    })

    it('prevents default behavior for keyboard shortcuts', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      const controlsElement = wrapper.find('.timer-controls')
      const mockEvent = {
        key: ' ',
        preventDefault: vi.fn()
      }
      
      await controlsElement.trigger('keydown', mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('ignores keyboard shortcuts on mobile', async () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'mobile'
        }
      })

      const controlsElement = wrapper.find('.timer-controls')
      await controlsElement.trigger('keydown', { key: ' ' })

      expect(wrapper.emitted('play')).toBeFalsy()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for all buttons', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus
        }
      })

      const buttons = wrapper.findAll('.timer-controls__button')
      buttons.forEach((button: any) => {
        expect(button.attributes('aria-label')).toBeTruthy()
      })
    })

    it('has proper tabindex for keyboard navigation', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      const controlsContainer = wrapper.find('.timer-controls')
      expect(controlsContainer.attributes('tabindex')).toBe('0')
    })

    it('shows keyboard shortcuts hint on desktop', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'desktop'
        }
      })

      const shortcutsHint = wrapper.find('.timer-controls__shortcut-hint')
      expect(shortcutsHint.exists()).toBe(true)
      expect(shortcutsHint.text()).toContain('Space: Play/Pause')
      expect(shortcutsHint.text()).toContain('N: Next')
      expect(shortcutsHint.text()).toContain('R: Restart')
    })

    it('does not show keyboard shortcuts hint on mobile', () => {
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'mobile'
        }
      })

      const shortcutsHint = wrapper.find('.timer-controls__shortcut-hint')
      expect(shortcutsHint.exists()).toBe(false)
    })
  })

  describe('Visual States', () => {
    it('applies correct CSS classes for different device types', () => {
      // Test mobile
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'mobile'
        }
      })
      expect(wrapper.find('.timer-controls--mobile').exists()).toBe(true)

      wrapper.unmount()

      // Test desktop
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus,
          deviceType: 'desktop'
        }
      })
      expect(wrapper.find('.timer-controls--desktop').exists()).toBe(true)
    })

    it('shows correct icons for play and pause states', () => {
      // Test play icon (idle state)
      wrapper = mount(TimerControls, {
        props: {
          status: 'idle' as PrayerStatus
        }
      })

      let playButton = wrapper.find('.timer-controls__button--primary')
      let playIcon = playButton.find('svg path')
      expect(playIcon.attributes('d')).toBe('M8 5v14l11-7z') // Play icon path

      wrapper.unmount()

      // Test pause icon (active state)
      wrapper = mount(TimerControls, {
        props: {
          status: 'active' as PrayerStatus
        }
      })

      playButton = wrapper.find('.timer-controls__button--primary')
      let pauseIcon = playButton.find('svg path')
      expect(pauseIcon.attributes('d')).toBe('M6 19h4V5H6v14zm8-14v14h4V5h-4z') // Pause icon path
    })
  })
})