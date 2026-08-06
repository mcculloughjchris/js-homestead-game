import { useNavigate } from "react-router-dom"
import useGameSettings from "../hooks/useGameSettings"

const Settings = () => {
  const navigate = useNavigate()
  const { settings, updateSettings } = useGameSettings()

  return (
    <div>
      <h1>Settings</h1>

      <div>
        <label htmlFor="music-volume">Music Volume</label>
        <input
          id="music-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.musicVolume}
          onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
        />
      </div>

      <div>
        <label htmlFor="sfx-volume">SFX Volume</label>
        <input
          id="sfx-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.sfxVolume}
          onChange={(e) => updateSettings({ sfxVolume: Number(e.target.value) })}
        />
      </div>

      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  )
}

export default Settings
