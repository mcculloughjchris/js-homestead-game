/**
 * Plays and manages every sound belonging to one channel (e.g. "music" or
 * "sfx"), with its own volume control independent of other channels.
 *
 * Built and owned by AudioManager - don't construct this directly; use
 * `audio.music`/`audio.sfx`/`audio.ui` (or whatever channels your manifest
 * defines) instead.
 *
 * Two playback modes, chosen per-channel via `allowOverlap`:
 * - overlap allowed (sfx/ui): every play() clones a fresh <audio> element, so
 *   rapid-fire sounds (footsteps, door knocks) layer instead of cutting each
 *   other off.
 * - overlap disallowed (music): the channel tracks a single "current" sound;
 *   playing a different one stops whatever was playing first, so music never
 *   plays over itself or another track.
 */
export class AudioChannel<TSoundName extends string = string> {
  private readonly sources: Record<TSoundName, string>

  /** One base <audio> element per sound, created during preload(). */
  private readonly templates = new Map<TSoundName, HTMLAudioElement>()

  /** Every instance of a sound currently playing/paused (only ever one entry for non-overlap channels). */
  private readonly activeInstances = new Map<TSoundName, Set<HTMLAudioElement>>()

  private readonly perSoundVolume = new Map<TSoundName, number>()
  private readonly fadeTimers = new Map<HTMLAudioElement, number>()

  private channelVolume = 1
  private channelMuted = false

  private readonly allowOverlap: boolean
  private readonly getMasterVolume: () => number
  private readonly getMasterMuted: () => boolean

  /** For non-overlap channels, whatever's considered "the" active sound right now. */
  private currentExclusiveSound: TSoundName | null = null

  constructor(
    sources: Record<TSoundName, string>,
    options: {
      allowOverlap: boolean
      getMasterVolume: () => number
      getMasterMuted: () => boolean
    }
  ) {
    this.sources = sources
    this.allowOverlap = options.allowOverlap
    this.getMasterVolume = options.getMasterVolume
    this.getMasterMuted = options.getMasterMuted
  }

  /** Creates an <audio> element for every sound in this channel and waits for each to be playable. */
  async preload(): Promise<void> {
    const names = Object.keys(this.sources) as TSoundName[]

    await Promise.all(
      names.map((name) => {
        return new Promise<void>((resolve, reject) => {
          const element = new Audio(this.sources[name])
          element.preload = 'auto'

          const handleReady = () => {
            element.removeEventListener('error', handleError)
            resolve()
          }

          const handleError = () => {
            element.removeEventListener('canplaythrough', handleReady)
            reject(new Error(`AudioManager: failed to load "${name}" from ${this.sources[name]}`))
          }

          element.addEventListener('canplaythrough', handleReady, { once: true })
          element.addEventListener('error', handleError, { once: true })

          this.templates.set(name, element)
          this.activeInstances.set(name, new Set())
          element.load()
        })
      })
    )
  }

  private getTemplate(name: TSoundName): HTMLAudioElement {
    const template = this.templates.get(name)

    if (!template) {
      throw new Error(`AudioManager: "${name}" was played before preload() finished (or isn't registered)`)
    }

    return template
  }

  private effectiveVolume(name: TSoundName): number {
    if (this.channelMuted || this.getMasterMuted()) return 0

    const perSound = this.perSoundVolume.get(name) ?? 1
    return perSound * this.channelVolume * this.getMasterVolume()
  }

  private applyVolume(instance: HTMLAudioElement, name: TSoundName): void {
    instance.volume = this.effectiveVolume(name)
  }

  private clearFade(instance: HTMLAudioElement): void {
    const handle = this.fadeTimers.get(instance)

    if (handle !== undefined) {
      window.clearInterval(handle)
      this.fadeTimers.delete(instance)
    }
  }

  private trackInstance(name: TSoundName, instance: HTMLAudioElement): void {
    let instances = this.activeInstances.get(name)

    if (!instances) {
      instances = new Set()
      this.activeInstances.set(name, instances)
    }

    instances.add(instance)
  }

  /** Starts a sound playing without touching whatever else is currently active (used by play() and fadeIn()). */
  private beginPlayback(name: TSoundName): HTMLAudioElement {
    const template = this.getTemplate(name)

    if (!this.allowOverlap) {
      this.currentExclusiveSound = name
      this.clearFade(template)
      template.currentTime = 0
      this.applyVolume(template, name)
      template.play().catch(() => {})
      this.trackInstance(name, template)

      return template
    }

    const instance = template.cloneNode(true) as HTMLAudioElement
    this.applyVolume(instance, name)

    instance.addEventListener('ended', () => {
      this.activeInstances.get(name)?.delete(instance)
    }, { once: true })

    this.trackInstance(name, instance)
    instance.play().catch(() => {})

    return instance
  }

  /** Plays a sound. On an overlap channel this always layers a new instance; on an
   *  exclusive (music) channel it stops whatever else was playing first. */
  play(name: TSoundName): HTMLAudioElement {
    if (!this.allowOverlap && this.currentExclusiveSound && this.currentExclusiveSound !== name) {
      this.stop(this.currentExclusiveSound)
    }

    return this.beginPlayback(name)
  }

  /** Plays one randomly-chosen sound from the given list. */
  playRandom(...names: TSoundName[]): HTMLAudioElement {
    const choice = names[Math.floor(Math.random() * names.length)]

    return this.play(choice)
  }

  stop(name: TSoundName): void {
    const instances = this.activeInstances.get(name)

    if (!instances) return

    instances.forEach((instance) => {
      this.clearFade(instance)
      instance.pause()
      instance.currentTime = 0
    })
    instances.clear()

    if (this.currentExclusiveSound === name) {
      this.currentExclusiveSound = null
    }
  }

  pause(name: TSoundName): void {
    this.activeInstances.get(name)?.forEach((instance) => instance.pause())
  }

  resume(name: TSoundName): void {
    this.activeInstances.get(name)?.forEach((instance) => instance.play().catch(() => {}))
  }

  stopAll(): void {
    Array.from(this.activeInstances.keys()).forEach((name) => this.stop(name))
  }

  loop(name: TSoundName): void {
    this.getTemplate(name).loop = true
  }

  /** Sets an individual sound's volume (0-1) within this channel. */
  setSoundVolume(name: TSoundName, volume: number): void {
    const clamped = Math.min(1, Math.max(0, volume))

    this.perSoundVolume.set(name, clamped)
    this.activeInstances.get(name)?.forEach((instance) => this.applyVolume(instance, name))
  }

  /** Sets this whole channel's volume (0-1) - e.g. audio.sfx.setVolume(0.7). */
  setVolume(volume: number): void {
    this.channelVolume = Math.min(1, Math.max(0, volume))
    this.refreshAllVolumes()
  }

  mute(): void {
    this.channelMuted = true
    this.refreshAllVolumes()
  }

  unmute(): void {
    this.channelMuted = false
    this.refreshAllVolumes()
  }

  /** Re-applies effective volume to every currently-active instance - called whenever
   *  channel/master volume or mute state changes. */
  refreshAllVolumes(): void {
    this.activeInstances.forEach((instances, name) => {
      instances.forEach((instance) => this.applyVolume(instance, name))
    })
  }

  private runFade(
    instance: HTMLAudioElement,
    from: number,
    to: number,
    duration: number,
    onComplete?: () => void
  ): void {
    this.clearFade(instance)

    const stepMs = 30
    const steps = Math.max(1, Math.round(duration / stepMs))
    let step = 0

    instance.volume = from

    const handle = window.setInterval(() => {
      step += 1
      const progress = Math.min(1, step / steps)
      instance.volume = from + (to - from) * progress

      if (progress >= 1) {
        this.clearFade(instance)
        onComplete?.()
      }
    }, stepMs)

    this.fadeTimers.set(instance, handle)
  }

  /** Plays a sound starting at volume 0 and ramps up to its normal volume over `duration` ms. */
  fadeIn(name: TSoundName, duration: number): HTMLAudioElement {
    const instance = this.beginPlayback(name)
    const target = this.effectiveVolume(name)

    this.runFade(instance, 0, target, duration)

    return instance
  }

  /** Ramps every active instance of a sound down to volume 0 over `duration` ms, then stops it. */
  fadeOut(name: TSoundName, duration: number): void {
    const instances = this.activeInstances.get(name)

    if (!instances || instances.size === 0) return

    instances.forEach((instance) => {
      this.runFade(instance, instance.volume, 0, duration, () => {
        instance.pause()
        instance.currentTime = 0
        this.activeInstances.get(name)?.delete(instance)

        if (this.currentExclusiveSound === name) {
          this.currentExclusiveSound = null
        }
      })
    })
  }

  /** Crossfades from whatever's currently playing on this channel to `name` (exclusive/music channels). */
  fadeTo(name: TSoundName, duration: number): void {
    const previous = this.currentExclusiveSound

    if (previous && previous !== name) {
      this.fadeOut(previous, duration)
    }

    this.fadeIn(name, duration)
  }
}
