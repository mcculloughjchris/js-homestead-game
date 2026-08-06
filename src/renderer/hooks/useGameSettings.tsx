import { useCallback, useEffect, useRef, useState } from "react"
import { audio } from "../audio"

export interface GameSettings {
  musicVolume: number
  sfxVolume: number
}

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1
}

/**
 * Loads game settings from main.ts on mount, keeps them in sync with any
 * other component via the 'settings-updated' broadcast (sent whenever
 * anyone saves), and applies musicVolume/sfxVolume to the AudioManager
 * whenever they change - so mounting this once at the app root (see App.tsx)
 * is enough to have volumes apply everywhere, not just on the settings screen.
 *
 * Safe to call from multiple components - each gets its own local copy of
 * `settings`, kept in sync via the broadcast rather than shared context.
 */
const useGameSettings = () => {
  const [ settings, setSettings ] = useState<GameSettings>(DEFAULT_SETTINGS)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    window.electron.ipcRenderer.invoke('load-settings').then((loaded: GameSettings) => {
      setSettings(loaded)
    })
  }, [])

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on('settings-updated', (updated: GameSettings) => {
      setSettings(updated)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    audio.music.setVolume(settings.musicVolume)
    audio.sfx.setVolume(settings.sfxVolume)
  }, [ settings ])

  const updateSettings = useCallback((partial: Partial<GameSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...partial }
      window.electron.ipcRenderer.invoke('save-settings', merged)
      return merged
    })
  }, [])

  return { settings, updateSettings }
}

export default useGameSettings
