import { useEffect, useRef, useState } from "react"
import { audio, AudioManager } from "../audio"

interface UseAudioResult {
  /** The shared AudioManager singleton - call audio.play("click"), audio.music.play("day"), etc. directly. */
  audio: AudioManager
  /** True once every sound in the manifest has finished preloading. */
  ready: boolean
  error: Error | null
}

/**
 * Preloads every registered sound (once - AudioManager.preload() is
 * idempotent, so it's safe to call this hook from more than one component)
 * and hands back the shared `audio` instance plus its loading status.
 *
 * The AudioManager itself has no React dependency; this hook only exists to
 * fit preload's promise into a component lifecycle and expose loading state
 * for things like a loading screen.
 */
const useAudio = (): UseAudioResult => {
  const [ ready, setReady ] = useState(false)
  const [ error, setError ] = useState<Error | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    audio.preload()
      .then(() => setReady(true))
      .catch((err: Error) => setError(err))
  }, [])

  return { audio, ready, error }
}

export default useAudio
