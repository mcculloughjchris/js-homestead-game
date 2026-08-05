import { audioManifest, ChannelName, ChannelSoundName, SoundName, findChannelForSound } from '../../static/audioManifest'
import { AudioChannel } from './AudioChannel'

/**
 * Singleton entry point for ALL audio in the game, built on plain
 * HTMLAudioElement (no Howler.js, no other audio library). Nothing outside
 * this module should touch HTMLAudioElement directly - import `audio` (this
 * module's default-ish export, see bottom) and use it everywhere sound needs
 * to play.
 *
 * Channels ("music", "sfx", "ui") come from audioManifest's top-level keys
 * and each get independent volume control - see `audio.music`/`audio.sfx`.
 * The flat methods here (play/stop/pause/etc.) look up which channel a sound
 * belongs to automatically, so most call sites never need to think about
 * channels at all.
 */
export class AudioManager {
  private static instance: AudioManager | null = null

  private masterVolume = 1
  private masterMuted = false
  private preloadPromise: Promise<void> | null = null

  private readonly channels: Record<ChannelName, AudioChannel<any>>

  /** Non-overlapping - playing a new track stops whatever was playing. */
  readonly music: AudioChannel<ChannelSoundName<'music'>>
  /** Overlap allowed - rapid sfx (footsteps, knocks) layer instead of cutting off. */
  readonly sfx: AudioChannel<ChannelSoundName<'sfx'>>
  /** Overlap allowed - UI blips (clicks, hovers). */
  readonly ui: AudioChannel<ChannelSoundName<'ui'>>

  private constructor() {
    const getMasterVolume = () => this.masterVolume
    const getMasterMuted = () => this.masterMuted

    this.music = new AudioChannel(audioManifest.music, {
      allowOverlap: false,
      getMasterVolume,
      getMasterMuted
    })

    this.sfx = new AudioChannel(audioManifest.sfx, {
      allowOverlap: true,
      getMasterVolume,
      getMasterMuted
    })

    this.ui = new AudioChannel(audioManifest.ui, {
      allowOverlap: true,
      getMasterVolume,
      getMasterMuted
    })

    this.channels = { music: this.music, sfx: this.sfx, ui: this.ui }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }

    return AudioManager.instance
  }

  private channelFor(name: SoundName): AudioChannel<any> {
    return this.channels[findChannelForSound(name)]
  }

  private get allChannels(): AudioChannel<any>[] {
    return Object.values(this.channels)
  }

  /**
   * Preloads every sound in every channel. Call once before gameplay begins
   * (e.g. on a loading screen) and await it before relying on play() to have
   * an already-loaded sound. Safe to call more than once (e.g. from multiple
   * components) - only the first call actually loads anything.
   */
  preload(): Promise<void> {
    if (!this.preloadPromise) {
      this.preloadPromise = Promise.all(
        this.allChannels.map((channel) => channel.preload())
      ).then(() => undefined)
    }

    return this.preloadPromise
  }

  play(name: SoundName): HTMLAudioElement {
    return this.channelFor(name).play(name)
  }

  /** Plays one randomly-chosen sound from the given names, e.g. playRandom("knock1", "knock2"). */
  playRandom(...names: SoundName[]): HTMLAudioElement {
    const choice = names[Math.floor(Math.random() * names.length)]

    return this.play(choice)
  }

  stop(name: SoundName): void {
    this.channelFor(name).stop(name)
  }

  pause(name: SoundName): void {
    this.channelFor(name).pause(name)
  }

  resume(name: SoundName): void {
    this.channelFor(name).resume(name)
  }

  stopAll(): void {
    this.allChannels.forEach((channel) => channel.stopAll())
  }

  /** Sets one sound's individual volume (0-1), independent of its channel/master volume. */
  setVolume(name: SoundName, volume: number): void {
    this.channelFor(name).setSoundVolume(name, volume)
  }

  /** Global volume (0-1) multiplied into every channel and every sound. */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.min(1, Math.max(0, volume))
    this.allChannels.forEach((channel) => channel.refreshAllVolumes())
  }

  /** Mutes everything, regardless of per-channel mute state. */
  mute(): void {
    this.masterMuted = true
    this.allChannels.forEach((channel) => channel.refreshAllVolumes())
  }

  unmute(): void {
    this.masterMuted = false
    this.allChannels.forEach((channel) => channel.refreshAllVolumes())
  }

  fadeIn(name: SoundName, duration: number): HTMLAudioElement {
    return this.channelFor(name).fadeIn(name, duration)
  }

  fadeOut(name: SoundName, duration: number): void {
    this.channelFor(name).fadeOut(name, duration)
  }

  loop(name: SoundName): void {
    this.channelFor(name).loop(name)
  }
}

/** The single shared AudioManager instance - import this, never call `new AudioManager()`. */
export const audio = AudioManager.getInstance()
