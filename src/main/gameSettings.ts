import path from 'path'
import fs from 'fs'

export interface GameSettings {
  musicVolume: number
  sfxVolume: number
}

export const defaultSettings: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1
}

/** Reads settings.json from the given save directory, falling back to defaults if it doesn't exist yet. */
export const loadSettings = async (savePath: string): Promise<GameSettings> => {
  try {
    const file = await fs.promises.readFile(path.join(savePath, 'settings.json'), { encoding: null })
    const text = new TextDecoder('utf-8').decode(file)

    return { ...defaultSettings, ...JSON.parse(text) }
  } catch (e) {
    return defaultSettings
  }
}

export const saveSettings = async (savePath: string, settings: GameSettings): Promise<void> => {
  await fs.promises.mkdir(savePath, { recursive: true })
  await fs.promises.writeFile(path.join(savePath, 'settings.json'), JSON.stringify(settings), 'utf-8')
}
