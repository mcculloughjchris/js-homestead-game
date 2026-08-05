/**
 * Central registry of every audio file in the game. This is the ONLY place a
 * sound file path should ever appear — everywhere else in the codebase must
 * refer to sounds by their manifest key (e.g. "click", "knock1"), never by
 * file path, and always go through the AudioManager (see ./audio/AudioManager)
 * to actually play one.
 *
 * Each top-level key is a "channel". Channels get independent volume control
 * and independent overlap behavior (see AudioManager) - e.g. "music" so a new
 * track doesn't play on top of the old one, vs. "sfx" where rapid-fire
 * footsteps/knocks should each play out fully.
 *
 * NOTE: these audio files don't exist in the repo yet - add your actual
 * assets at these paths (or edit the imports below to point wherever you put
 * them). Webpack resolves each import to a real URL at build time via the
 * asset/resource rule added to the renderer configs, same as how room
 * background images are imported elsewhere in this codebase.
 */
import knock1 from '../../assets/audio/door/door_knock_hard_1.wav'
import knock2 from '../../assets/audio/door/door_knock_hard_2.wav'
import knock3 from '../../assets/audio/door/door_knock_normal_1.wav'
import knock4 from '../../assets/audio/door/door_knock_normal_2.wav'
import button_press from '../../assets/audio/button/button_click.wav'
import intro from '../../assets/audio/intro.wav'

export const audioManifest = {
  ui: {
  },
  sfx: {
    knock1,
    knock2,
    knock3,
    knock4,
    button_press,
    intro
  },
  music: {
  }
} as const

/** Names of the channels (the manifest's top-level keys). */
export type ChannelName = keyof typeof audioManifest

/** Sound names scoped to one channel, e.g. ChannelSoundName<'music'> = "title" | "day" | "night". */
export type ChannelSoundName<C extends ChannelName> = keyof (typeof audioManifest)[C] & string

/**
 * Every sound name across every channel, flattened into one union - this is
 * what gives play("click")/setVolume("knock1", ...) etc. compile-time
 * checking against typos, without needing a channel prefix.
 *
 * Assumes sound names are unique across the whole manifest; if the same key
 * appears in two channels, the flat lookup (findChannelForSound) will only
 * ever resolve to whichever channel is checked first.
 */
export type SoundName = {
  [C in ChannelName]: ChannelSoundName<C>
}[ChannelName]

/** Finds which channel a given sound name belongs to. Throws if it's not registered anywhere. */
export const findChannelForSound = (sound: SoundName): ChannelName => {
  const channel = (Object.keys(audioManifest) as ChannelName[]).find(
    (candidate) => sound in audioManifest[candidate]
  )

  if (!channel) {
    throw new Error(`AudioManager: unknown sound "${sound}" - is it registered in audioManifest?`)
  }

  return channel
}
