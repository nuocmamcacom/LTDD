import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const SOUND_ENABLED_KEY = '@chess_app_sound_enabled';
const SOUND_VOLUME_KEY = '@chess_app_sound_volume';

class SoundManager {
  private isEnabled = true;
  private volume = 0.8;
  private sounds: { [key: string]: Audio.Sound } = {};

  constructor() {
    this.loadSettings();
  }

  private async loadSettings() {
    try {
      const enabledValue = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      const volumeValue = await AsyncStorage.getItem(SOUND_VOLUME_KEY);
      
      if (enabledValue !== null) {
        this.isEnabled = JSON.parse(enabledValue);
      }
      
      if (volumeValue !== null) {
        this.volume = parseFloat(volumeValue);
      }
      
      console.log(`🔊 Sound settings loaded: enabled=${this.isEnabled}, volume=${this.volume}`);
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
    }
  }

  async setSoundEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, JSON.stringify(enabled));
      console.log(`🔊 Sound ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.warn('Failed to save sound enabled setting:', error);
    }
  }

  async setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    try {
      await AsyncStorage.setItem(SOUND_VOLUME_KEY, this.volume.toString());
      console.log(`🔊 Volume set to ${Math.round(this.volume * 100)}%`);
    } catch (error) {
      console.warn('Failed to save volume setting:', error);
    }
  }

  getVolume(): number {
    return this.volume;
  }

  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  async loadSounds() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load movie_1.mp3 for move sounds
      try {
        const { sound: movieSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/movie_1.mp3'),
          { shouldPlay: false }
        );
        this.sounds.movie = movieSound;
        console.log('🎬 Loaded movie_1.mp3 for move sounds');
      } catch (e) {
        console.warn('Could not load movie_1.mp3:', e);
      }

      // Load phai-chiu.mp3 for game over
      try {
        const { sound: phaiChiuSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/phai-chiu.mp3'),
          { shouldPlay: false }
        );
        this.sounds.phaiChiu = phaiChiuSound;
        console.log('🏆 Loaded phai-chiu.mp3 for game over');
      } catch (e) {
        console.warn('Could not load phai-chiu.mp3:', e);
      }

      // Load suprisee.mp3 for check sounds
      try {
        const { sound: supriseeSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/suprisee.mp3'),
          { shouldPlay: false }
        );
        this.sounds.suprisee = supriseeSound;
        console.log('👑 Loaded suprisee.mp3 for check sounds');
      } catch (e) {
        console.warn('Could not load suprisee.mp3:', e);
      }

      console.log('🔊 Sound system initialized');
    } catch (error) {
      console.warn('Failed to initialize sound system:', error);
    }
  }

  async playSound(soundName: 'move' | 'capture' | 'check' | 'gameOver') {
    if (!this.isEnabled) return;

    try {
      let targetSound: Audio.Sound | null = null;
      
      // Choose the appropriate sound
      if (soundName === 'move' && this.sounds.movie) {
        targetSound = this.sounds.movie;
      } else if (soundName === 'gameOver' && this.sounds.phaiChiu) {
        targetSound = this.sounds.phaiChiu;
      } else if (soundName === 'check' && this.sounds.suprisee) {
        targetSound = this.sounds.suprisee;
      }

      if (targetSound) {
        // Set volume before playing
        await targetSound.setVolumeAsync(this.volume);
        await targetSound.replayAsync();
        console.log(`🎬 Playing ${soundName} sound at ${Math.round(this.volume * 100)}% volume`);
      } else {
        console.log(`🔊 Playing ${soundName} sound (fallback)`);
      }
      
    } catch (error) {
      console.warn(`Failed to play ${soundName} sound:`, error);
    }
  }

  // Method for Settings screen to test sound
  async playMoveSound() {
    await this.playSound('move');
  }

  async playTestSound() {
    await this.playMoveSound();
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    console.log(`Sound ${this.isEnabled ? 'enabled' : 'disabled'}`);
    return this.isEnabled;
  }

  async cleanup() {
    console.log('🧹 Sound cleanup');
    for (const sound of Object.values(this.sounds)) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn('Error unloading sound:', error);
      }
    }
    this.sounds = {};
  }
}

export const soundManager = new SoundManager();
