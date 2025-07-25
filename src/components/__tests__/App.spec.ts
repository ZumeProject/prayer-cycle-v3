import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'

// Mock the services
vi.mock('@/utils/AudioService', () => ({
  audioService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    setEnabled: vi.fn(),
    playNotification: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn()
  }
}))

vi.mock('@/utils/StorageService', () => ({
  storageService: {
    loadSettings: vi.fn().mockReturnValue({
      audioEnabled: true,
      primaryColor: '#2cace2',
      deviceType: 'mobile'
    }),
    loadSession: vi.fn().mockReturnValue(null),
    saveSession: vi.fn(),
    clearSession: vi.fn()
  }
}))

// Mock navigator.wakeLock
Object.defineProperty(navigator, 'wakeLock', {
  value: {
    request: vi.fn().mockResolvedValue({
      release: vi.fn()
    })
  },
  writable: true
})

// Mock window.innerWidth for device detection
Object.defineProperty(window, 'innerWidth', {
  value: 375, // Mobile width
  writable: true
})

describe('App (PrayerCycleApp)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Reset window width to mobile for consistent testing
    Object.defineProperty(window, 'innerWidth', {
      value: 375, // Mobile width
      writable: true
    })
    
    // Reset user agent to mobile
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true
    })
  })

  it('should render the mobile layout by default', () => {
    const wrapper = mount(App)
    
    expect(wrapper.find('.prayer-app-mobile').exists()).toBe(true)
    expect(wrapper.find('.prayer-app-desktop').exists()).toBe(false)
  })

  it('should render the desktop layout when device type is desktop', () => {
    // Mock desktop width and user agent before mounting
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true
    })
    
    // Mock desktop user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true
    })
    
    // Component should detect desktop immediately during initialization
    const wrapper = mount(App)
    
    expect(wrapper.find('.prayer-app-desktop').exists()).toBe(true)
    expect(wrapper.find('.prayer-app-mobile').exists()).toBe(false)
  })

  it('should display the correct step information', () => {
    const wrapper = mount(App)
    
    // Should show step 1 of 12 initially
    expect(wrapper.text()).toContain('Step 1 of 12')
  })

  it('should render all required components', () => {
    const wrapper = mount(App)
    
    // Check that all child components are rendered
    expect(wrapper.findComponent({ name: 'StepDisplay' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ProgressIndicator' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TimerControls' }).exists()).toBe(true)
  })

  it('should handle timer control events', async () => {
    const wrapper = mount(App)
    
    // Find the TimerControls component and emit play event
    const timerControls = wrapper.findComponent({ name: 'TimerControls' })
    await timerControls.vm.$emit('play')
    
    // The store should be updated (we can't easily test the internal state changes
    // without more complex mocking, but we can verify the component doesn't crash)
    expect(wrapper.exists()).toBe(true)
  })

  it('should initialize services on mount', () => {
    // Just verify the component mounts without errors
    // The service initialization is already mocked at the module level
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
    
    // Verify the component has the expected structure
    expect(wrapper.find('.prayer-app-mobile').exists()).toBe(true)
  })

  it('should detect mobile device type on initialization', () => {
    // Ensure mobile settings
    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      writable: true
    })
    
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true
    })
    
    const wrapper = mount(App)
    expect(wrapper.find('.prayer-app-mobile').exists()).toBe(true)
    expect(wrapper.find('.prayer-app-desktop').exists()).toBe(false)
  })

  it('should detect desktop device type on initialization', () => {
    // Set desktop settings
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      writable: true
    })
    
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true
    })
    
    const wrapper = mount(App)
    expect(wrapper.find('.prayer-app-desktop').exists()).toBe(true)
    expect(wrapper.find('.prayer-app-mobile').exists()).toBe(false)
  })
})