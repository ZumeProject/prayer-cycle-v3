/**
 * Service for detecting and managing offline state
 * Provides offline detection and user feedback capabilities
 */
export class OfflineService {
  private onlineCallbacks: (() => void)[] = []
  private offlineCallbacks: (() => void)[] = []
  private isOnlineState: boolean = navigator.onLine

  constructor() {
    this.setupEventListeners()
  }

  /**
   * Set up event listeners for online/offline events
   */
  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnlineState = true
    this.onlineCallbacks.forEach(callback => callback())
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnlineState = false
    this.offlineCallbacks.forEach(callback => callback())
  }

  /**
   * Get current online status
   */
  get isOnline(): boolean {
    return this.isOnlineState
  }

  /**
   * Get current offline status
   */
  get isOffline(): boolean {
    return !this.isOnlineState
  }

  /**
   * Register callback for when connection comes back online
   */
  onOnline(callback: () => void): void {
    this.onlineCallbacks.push(callback)
  }

  /**
   * Register callback for when connection goes offline
   */
  onOffline(callback: () => void): void {
    this.offlineCallbacks.push(callback)
  }

  /**
   * Remove online callback
   */
  removeOnlineCallback(callback: () => void): void {
    const index = this.onlineCallbacks.indexOf(callback)
    if (index > -1) {
      this.onlineCallbacks.splice(index, 1)
    }
  }

  /**
   * Remove offline callback
   */
  removeOfflineCallback(callback: () => void): void {
    const index = this.offlineCallbacks.indexOf(callback)
    if (index > -1) {
      this.offlineCallbacks.splice(index, 1)
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))
    this.onlineCallbacks = []
    this.offlineCallbacks = []
  }
}

// Export singleton instance
export const offlineService = new OfflineService()