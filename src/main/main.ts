/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs'
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { leftOf, oneSpaceBackward, oneSpaceForward, oppositeOf, resolveHtmlPath, rightOf } from './util';
import { randomUUID } from 'crypto';
import { roomValues } from '../static/mapData';
import playerActions from '../static/playerActions';
import characters, { Character } from '../static/characterData';

const savePath = path.join(app.getPath("appData"), "homesteading")

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const newGameData = (name: string) => {
  const characterPositions = () => Object.values(characters).map((c: Character) => ({
    name: c.name,
    path: null,
    direction: null
  }))

  return {
    id: randomUUID(),
    name: name,
    tutorialed: false,
    hunger: 100,
    thirst: 100,
    money: 100,
    days: [[]],
    saves: 0,
    currentLocation: "lroom0",
    currentDirection: "s",
    currentDoor: null,
    characterPositions: characterPositions(),
    completedConvos: []
  }
}

// Trigger a new game
ipcMain.handle('trigger-new-game', async (e, name) => {
  const data = newGameData(name)

  try {
    await fs.promises.mkdir(savePath)
  } catch (e) {
    console.error('Error creating dir: ', e)
  }

  try {
    await fs.promises.appendFile(path.join(savePath, 'saves.json'), `${data.id},`)
  } catch (e) {
    console.error('Error adding to file: ', path.join(savePath, 'saves.json'))
  }

  const filePath = path.join(savePath, `${data.id}.json`)

  await fs.promises.writeFile(filePath, JSON.stringify(data), 'utf-8')

  return data
})

// Save the game
ipcMain.handle('save-game', async (e, data) => {
  const filePath = path.join(savePath, `${data.id}.json`)
  data.saves += 1
  await fs.promises.writeFile(filePath, JSON.stringify(data))
  return data
})

// Load a game
ipcMain.handle('load-game', async (e, id) => {
  const filePath = path.join(savePath, `${id}.json`)

  const file = await fs.promises.readFile(filePath, { encoding: null })
  const text = new TextDecoder('utf-8').decode(file)
  const data = JSON.parse(text)

  return data
})

// List the available game saves
ipcMain.handle('list-saves', async () => {
  const listFile = await fs.promises.readFile(path.join(savePath, `saves.json`), { encoding: null })
  const text = new TextDecoder('utf-8').decode(listFile)

  const ids = text.split(",").filter(s => s !== "")

  let response: [] = []

  await Promise.all(ids.map(async (id): Promise<number> => {
    const file = await fs.promises.readFile(path.join(savePath, `${id}.json`), { encoding: null })
    const text = new TextDecoder('utf-8').decode(file)
    const data = JSON.parse(text)

    response.push([data.id, {
      name: data.name,
      currentLocation: data.currentLocation,
      currentDirection: data.currentDirection
    }])
  }));

  return response
})

// Handle a keypress
ipcMain.handle('keypress', async (e, data) => {
  const { key, game } = data
  const { currentLocation, currentDirection } = game

  const room = Object.values(roomValues).find((r) => r.path === currentLocation)

  if (key === "w") { // player wants to move foward
    let newLocation = null

    if (room !== undefined) {
      if (room.boundary !== undefined && room.boundary !== null) {
        if (room.boundary.indexOf(currentDirection) === -1) {
          newLocation = oneSpaceForward(currentLocation, currentDirection)
        }
      } else {
        newLocation = oneSpaceForward(currentLocation, currentDirection)
      }
    }

    if (newLocation !== null) {
      const days = [...game.days]
      days[days.length - 1] = [...days[days.length - 1], playerActions.move]

      return {
        newLocation,
        days
      }
    }
  }

  if (key === "s") { // player wants to move backward
    let newLocation = null

    if (room !== undefined) {
      if (room.boundary !== undefined && room.boundary !== null) {
        if (room.boundary.indexOf(oppositeOf(currentDirection)) === -1) {
          newLocation = oneSpaceBackward(currentLocation, currentDirection)
        }
      } else {
        newLocation = oneSpaceBackward(currentLocation, currentDirection)
      }
    }

    if (newLocation !== null) {
      const days = [...game.days]
      days[days.length - 1] = [...days[days.length - 1], playerActions.move]

      return {
        newLocation,
        days
      }
    }
  }

  if (key === "a") { // player wants to turn left
    const newDirection = leftOf(currentDirection)

    return {
      newDirection
    }
  }

  if (key === "d") { // player wants to turn right
    const newDirection = rightOf(currentDirection)

    return {
      newDirection
    }
  }
})

// Trigger a door knock
ipcMain.handle('trigger-door-knock', (_e, gameData) => {
  const availableCharacters = gameData.characterPositions.filter(c => c.path === null)
  const chosenCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)]

  gameData.characterPositions = gameData.characterPositions.map((c: any) => ({
    ...c,
    path: chosenCharacter.name === c.name ? 'front-door' : c.path,
    direction: chosenCharacter.name === c.name ? 'n' : c.direction
  }))
  gameData.currentDoor = chosenCharacter.name

  mainWindow?.webContents.send('door-knock', gameData)
})

// Start a conversation
ipcMain.handle('convo-start', (_e, characterName, game) => {
  const character = characters[characterName]
  if (!character) return

  // no introduction yet, start that convo
  const introConvo = `${character.name.toLowerCase()}_introduction`
  if (game.completedConvos.indexOf(introConvo) === -1) {
    return character.conversations?.find(c => c.id === introConvo)
  }
})

// Respond to a conversation
ipcMain.handle('convo-respond', (_e, response, id, game) => {
  const character = characters[game.currentDoor]
  if (!character) return

  const convo = character.conversations?.find(c => c.id === response.goto)

  if (convo) {
    game.completedConvos = [
      ...game.completedConvos,
      id
    ]
    mainWindow?.webContents.send('update-game-data', game)

    return convo
  }
})

// End a convo
ipcMain.handle('convo-end', (_e, id, game) => {
  const character = characters[game.currentDoor]
  if (!character) return

  const convo = character.conversations?.find(c => c.id === id)

  if (convo?.afterContinue) {
    const [ method, a ] = convo.afterContinue.split('(')
    const args: string[] = a.replace(')', '').split('\'').filter(f => f !== "")

    switch (method) {
      case 'pickSleepingSpace':
        // @ts-ignore
        return pickSleepingSpace(game, ...args)
        break;
      case 'leaveDoor':
        return leaveDoor(game, ...args)
    }
  }
})

ipcMain.handle('set-character-position', (_e, game, character, campable) => {
  const result = { ...game }
  result.characterPositions = result.characterPositions.map(char => {
    if (char.name === character) {
      return {
        ...char,
        path: campable.path,
        direction: campable.direction
      }
    }

    return char
  })
  result.currentDoor = undefined

  mainWindow?.webContents.send('update-game-data', result)
  mainWindow?.webContents.send('character-position-set')

  return result
})

const pickSleepingSpace = (game: any, who: string) => {
  mainWindow?.webContents.send('redirect', `/${game.id}/set-character-position/${who}`)
}

const leaveDoor = (game: any, who: string) => {
  const response = {
    ...game
  }
  response.currentDoor = undefined
  response.characterPositions = game.characterPositions.map(c => {
    if (c.name === who) {
      return {
        ...c,
        path: null,
        direction: null
      }
    }

    return c
  })
  mainWindow?.webContents.send('update-game-data', response)
  return response
}

ipcMain.handle('quit', () => {
  app.quit()
})

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
