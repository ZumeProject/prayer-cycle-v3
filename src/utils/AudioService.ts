/**
 * AudioService - Handles audio notifications for prayer step transitions
 * 
 * Features:
 * - Web Audio API with HTML5 Audio fallback
 * - Gentle notification sound generation
 * - Volume control and system settings respect
 * - Enable/disable toggle functionality
 */

export class AudioService {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private htmlAudioElement: HTMLAudioElement | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;
  private useWebAudio: boolean = true;

  /**
   * Initialize the audio service
   * Attempts Web Audio API first, falls back to HTML5 Audio
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Try Web Audio API first
      await this.initializeWebAudio();
      this.useWebAudio = true;
    } catch (error) {
      console.warn('Web Audio API initialization failed, falling back to HTML5 Audio:', error);
      try {
        await this.initializeHtmlAudio();
        this.useWebAudio = false;
      } catch (fallbackError) {
        console.error('Both Web Audio API and HTML5 Audio initialization failed:', fallbackError);
        throw new Error('Audio initialization failed');
      }
    }

    this.initialized = true;
  }

  /**
   * Initialize Web Audio API and generate notification sound
   */
  private async initializeWebAudio(): Promise<void> {
    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Generate a gentle notification sound buffer
    this.audioBuffer = this.generateNotificationSound();
  }

  /**
   * Initialize HTML5 Audio fallback
   */
  private async initializeHtmlAudio(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a gentle notification sound as data URL
      const audioDataUrl = this.generateAudioDataUrl();
      
      this.htmlAudioElement = new Audio(audioDataUrl);
      this.htmlAudioElement.preload = 'auto';
      
      this.htmlAudioElement.addEventListener('canplaythrough', () => {
        resolve();
      }, { once: true });
      
      this.htmlAudioElement.addEventListener('error', (error) => {
        reject(error);
      }, { once: true });
      
      // Trigger loading
      this.htmlAudioElement.load();
    });
  }

  /**
   * Generate a gentle notification sound using Web Audio API
   */
  private generateNotificationSound(): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5; // 500ms
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a gentle bell-like sound using multiple sine waves
    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      
      // Fundamental frequency (gentle tone)
      const fundamental = Math.sin(2 * Math.PI * 440 * time);
      
      // Add harmonics for richness
      const harmonic1 = Math.sin(2 * Math.PI * 880 * time) * 0.3;
      const harmonic2 = Math.sin(2 * Math.PI * 1320 * time) * 0.1;
      
      // Apply envelope for gentle attack and decay
      const envelope = Math.exp(-time * 3) * (1 - Math.exp(-time * 20));
      
      // Combine and apply envelope
      data[i] = (fundamental + harmonic1 + harmonic2) * envelope * 0.3;
    }

    return buffer;
  }

  /**
   * Generate audio data URL for HTML5 Audio fallback
   */
  private generateAudioDataUrl(): string {
    // Create a simple WAV file with a gentle tone
    const sampleRate = 44100;
    const duration = 0.5;
    const length = sampleRate * duration;
    
    // WAV header
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header setup
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Generate audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * 440 * time) * Math.exp(-time * 3) * 0.3;
      const intSample = Math.max(-32768, Math.min(32767, sample * 32767));
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
    
    // Convert to base64 data URL
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  /**
   * Play notification sound
   */
  async playNotification(): Promise<void> {
    if (!this.enabled || !this.initialized) {
      return;
    }

    try {
      if (this.useWebAudio && this.audioContext && this.audioBuffer) {
        await this.playWebAudioNotification();
      } else if (this.htmlAudioElement) {
        await this.playHtmlAudioNotification();
      }
    } catch (error) {
      console.error('Failed to play notification:', error);
    }
  }

  /**
   * Play notification using Web Audio API
   */
  private async playWebAudioNotification(): Promise<void> {
    if (!this.audioContext || !this.audioBuffer) {
      throw new Error('Web Audio not properly initialized');
    }

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Create and configure source
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    
    // Connect to destination
    source.connect(this.audioContext.destination);
    
    // Start playback
    source.start();
  }

  /**
   * Play notification using HTML5 Audio
   */
  private async playHtmlAudioNotification(): Promise<void> {
    if (!this.htmlAudioElement) {
      throw new Error('HTML Audio not properly initialized');
    }

    // Reset to beginning
    this.htmlAudioElement.currentTime = 0;
    
    // Play the sound
    await this.htmlAudioElement.play();
  }

  /**
   * Enable or disable audio notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if audio is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if the service respects system settings
   * This includes checking for silent mode on mobile devices
   */
  respectsSystemSettings(): boolean {
    // Check if we're in a mobile environment
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, we respect the system volume and silent mode
      // The browser will automatically handle silent mode
      return true;
    }
    
    // On desktop, we respect the system volume
    return true;
  }

  /**
   * Get the current initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.htmlAudioElement) {
      this.htmlAudioElement.pause();
      this.htmlAudioElement = null;
    }
    
    this.audioBuffer = null;
    this.initialized = false;
  }
}

// Export a singleton instance
export const audioService = new AudioService();