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
import { roomValues } from '../static/mapData';
import playerActions from '../static/playerActions';
import characters from '../static/characterData';
import plantTypes from '../static/plantTypes';
import seedItems from '../static/seedTypes';
import newGameData from './newGameData';
import { addDayAction, onDayActionAdded } from './dayActions';
import { GameSettings, defaultSettings, loadSettings, saveSettings } from './gameSettings';
import { PLAYER_INVENTORY_ID, addItem, hasItem, removeItem, transferItem } from '../static/inventory';
import items from '../static/items';
import inspectionManager from './inspection/InspectionManager';
import { formatTime24Hour, getCurrentDecimalHours } from '../static/gameTime';
import { createRNG } from '../static/rng';

const savePath = path.join(app.getPath("appData"), "homesteading")

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// Runs any time an action is appended to the current day (see dayActions.ts).
// Add stat depletion/other side effects here as they're needed.
const MAX_DOOR_KNOCKS_PER_DAY = 3
// Each move only advances the clock ~18s (playerActions.move.timeCost), so
// without a probability roll here a knock is guaranteed on essentially the
// very next move once the clock ticks past DOOR_KNOCK_START_TIME - nowhere
// near enough time to actually walk to the door first. Rolling a chance per
// qualifying move instead spreads knocks out over the day.
const DOOR_KNOCK_START_TIME = 800
const DOOR_KNOCK_CHANCE_PER_TICK = 0.05
const doorKnockRng = createRNG()

onDayActionAdded((game, action, currentTime) => {
  if (
    parseInt(currentTime) > DOOR_KNOCK_START_TIME &&
    (game.doorKnocksToday ?? 0) < MAX_DOOR_KNOCKS_PER_DAY &&
    doorKnockRng.chance(DOOR_KNOCK_CHANCE_PER_TICK)
  ) {
    triggerDoorKnock(game, currentTime)
  }
})

// How much hunger/thirst/health build up or drain per hour of in-game time
// passing (tune to taste)
const HUNGER_PER_HOUR = 5
const THIRST_PER_HOUR = 7
const HEALTH_DECAY_PER_HOUR = 10

onDayActionAdded((game, action) => {
  if (game.gameEnded) return

  game.hunger = Math.min(100, game.hunger + action.timeCost * HUNGER_PER_HOUR)
  game.thirst = Math.min(100, game.thirst + action.timeCost * THIRST_PER_HOUR)

  if (game.hunger >= 100 || game.thirst >= 100) {
    game.health = Math.max(0, game.health - action.timeCost * HEALTH_DECAY_PER_HOUR)
  }

  if (game.health <= 0) {
    console.log('redirect!')
    game.gameEnded = true
    mainWindow?.webContents.send('redirect', `/${game.id}/game-over`)
  }

  // Only send the fields this listener actually changed - it fires on every
  // single move, so broadcasting the whole (possibly-stale) game object here
  // races with the keypress handler's own newLocation update and can
  // intermittently stomp on it depending on which arrives first.
  mainWindow?.webContents.send('update-game-data', {
    hunger: game.hunger,
    thirst: game.thirst,
    health: game.health,
    gameEnded: game.gameEnded
  })
})

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

let currentSettings: GameSettings = defaultSettings

// Load game settings (music/sfx volume, etc.)
ipcMain.handle('load-settings', async () => {
  currentSettings = await loadSettings(savePath)
  return currentSettings
})

// Save game settings and notify the renderer of the change
ipcMain.handle('save-settings', async (_e, settings: GameSettings) => {
  currentSettings = settings
  await saveSettings(savePath, settings)
  mainWindow?.webContents.send('settings-updated', currentSettings)
  return currentSettings
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
      const updatedGame = addDayAction(game, playerActions.move)

      // The action itself may have ended the game (e.g. health hit 0 and a
      // redirect to game-over was already sent) — don't also tell the
      // renderer to navigate to the new room, which would clobber that.
      if (updatedGame.gameEnded) {
        return { days: updatedGame.days }
      }

      return {
        newLocation,
        days: updatedGame.days
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
      const updatedGame = addDayAction(game, playerActions.move)

      // The action itself may have ended the game (e.g. health hit 0 and a
      // redirect to game-over was already sent) — don't also tell the
      // renderer to navigate to the new room, which would clobber that.
      if (updatedGame.gameEnded) {
        return { days: updatedGame.days }
      }

      return {
        newLocation,
        days: updatedGame.days
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

// Real wall-clock time (not in-game time) the player has to answer the door
// before whoever's knocking gives up and leaves.
const DOOR_KNOCK_ANSWER_TIMEOUT_MS = 60000
let pendingDoorKnockTimeout: ReturnType<typeof setTimeout> | null = null

const triggerDoorKnock = (gameData, currentTime: number, who = '') => {
  const currentDay = gameData.days.length - 1

  // A forced `who` (debug/testing only) bypasses the normal eligibility
  // rules entirely - day unlock, active hours, starter-convo completion -
  // so a specific character can always be triggered on demand regardless of
  // where you are in the game. Automatic/random selection still respects
  // all of them.
  let chosenCharacter

  if (who !== '') {
    chosenCharacter = gameData.characterPositions.find((c) => c.name === who)
  } else {
    const availableCharacters = gameData.characterPositions.filter(c => {
      const character = characters[c.name]
      if (c.path !== null || character.conversations?.length === 0) return false

      if ((character.unlockAfterDays ?? 0) > currentDay) return false

      if (character.activeHours) {
        if (currentTime < character.activeHours.start || currentTime > character.activeHours.end) return false
      }

      const starterConvos = character.conversations?.filter(convo => convo.starter)

      return starterConvos?.some(convo => gameData.completedConvos.indexOf(convo.id) === -1)
    })

    chosenCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)]
  }

  if (chosenCharacter === undefined) return

  gameData.characterPositions = gameData.characterPositions.map((c: any) => ({
    ...c,
    path: chosenCharacter.name === c.name ? 'front-door' : c.path,
    direction: chosenCharacter.name === c.name ? 'n' : c.direction
  }))
  gameData.currentDoor = chosenCharacter.name
  gameData.doorKnocksToday = (gameData.doorKnocksToday ?? 0) + 1

  // Only the fields actually changed here - see the hunger/thirst listener
  // above for why sending the whole (possibly-stale) gameData races with
  // concurrent movement updates.
  mainWindow?.webContents.send('door-knock', {
    characterPositions: gameData.characterPositions,
    currentDoor: gameData.currentDoor,
    doorKnocksToday: gameData.doorKnocksToday
  })

  // Give up and leave if the player doesn't answer in time. convo-start
  // clears this as soon as the player actually answers - if it fires, we
  // know they never did. Broadcasting a full stale characterPositions here
  // (captured now, applied 60s later) would risk clobbering unrelated
  // changes made in the meantime, so the renderer does the actual reset
  // itself, safely, against whatever state is current when it lands - see
  // handleDoorKnockTimeout in useGame.tsx.
  if (pendingDoorKnockTimeout) clearTimeout(pendingDoorKnockTimeout)

  const knockingCharacter = chosenCharacter.name

  pendingDoorKnockTimeout = setTimeout(() => {
    pendingDoorKnockTimeout = null
    mainWindow?.webContents.send('door-knock-timeout', knockingCharacter)
  }, DOOR_KNOCK_ANSWER_TIMEOUT_MS)
}

// Trigger a door knock
ipcMain.handle('trigger-door-knock', (_e, gameData, who = '') => {
  const currentTime = formatTime24Hour(getCurrentDecimalHours(gameData.days))
  triggerDoorKnock(gameData, currentTime, who)
})

// Debug/testing only - looks an item up by its display name and adds one to the player's inventory
ipcMain.handle('trigger-add-item-to-inventory', (_e, gameData, itemName: string) => {
  const item = Object.values(items).find((i) => i.id.toLowerCase() === itemName.toLowerCase())
  if (!item) return null

  const updatedGame = addItem(gameData, PLAYER_INVENTORY_ID, item.id, 1)
  mainWindow?.webContents.send('update-game-data', updatedGame)

  return updatedGame
})

// Start a conversation
ipcMain.handle('convo-start', (_e, characterName, game) => {
  // The player answered in time - cancel the door-knock timeout so it
  // doesn't kick this character out from under an active conversation later.
  if (pendingDoorKnockTimeout) {
    clearTimeout(pendingDoorKnockTimeout)
    pendingDoorKnockTimeout = null
  }

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
  const respondedConvo = character.conversations?.find(c => c.id === id)

  const gameResult = addDayAction(game, playerActions.respond)

  if (convo) {
    // Repeatable conversations never get marked completed, so they stay
    // available both to talk to again (convo-start) and for future
    // door-knock eligibility (triggerDoorKnock) - see characterData.tsx's
    // Conversation.repeatable.
    if (!respondedConvo?.repeatable) {
      gameResult.completedConvos = [
        ...gameResult.completedConvos,
        id
      ]
    }

    mainWindow?.webContents.send('update-game-data', gameResult)

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
      case 'startInspection':
        // @ts-ignore
        return startInspection(game, ...args)
      case 'fight':
        return fight(game, ...args)
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
  mainWindow?.webContents.send('update-game-data', { inConversation: false })
  mainWindow?.webContents.send('redirect', `/${game.id}/set-character-position/${who}`)
}

const leaveDoor = (game: any, who: string) => {
  const response = {
    ...game
  }
  response.currentDoor = undefined
  response.forcedConversation = undefined
  response.inConversation = false
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

// Kicks off Inspection Mode for the given character - see InspectionManager for the
// actual walk/search/discover state machine. React only renders game.inspection.
const startInspection = (game: any, officerName: string) => {
  const character = characters[officerName]
  if (!character) return game

  // The officer has physically left the doorway to walk through the house,
  // so the door conversation UI shouldn't still be showing.
  const gameWithoutDoor = { ...game, currentDoor: undefined }

  return inspectionManager.start(gameWithoutDoor, officerName, {
    onUpdate: (updatedGame) => {
      mainWindow?.webContents.send('update-game-data', updatedGame)
    },
    onCaught: (updatedGame) => {
      const caughtConvo = character.conversations?.find(c => c.id === 'officer_caught')

      // Put the officer back at the door and hand control to the dialogue
      // system with a forced conversation - see CharacterConversation.tsx,
      // which watches game.forcedConversation and adopts it directly rather
      // than waiting for the player to click "Talk"/"Answer door".
      const finalGame = {
        ...updatedGame,
        currentDoor: officerName,
        characterPositions: updatedGame.characterPositions.map((c: any) => (
          c.name === officerName ? { ...c, path: 'front-door', direction: 'n' } : c
        )),
        forcedConversation: caughtConvo ? { characterName: officerName, conversation: caughtConvo } : undefined
      }

      mainWindow?.webContents.send('update-game-data', finalGame)
    },
    onComplete: (updatedGame) => {
      const allClearConvo = character.conversations?.find(c => c.id === 'officer_all_clear')

      // Same pattern as onCaught - officer's back at the door for one last
      // exchange before actually leaving (which officer_all_clear's own
      // afterContinue/leaveDoor handles).
      const finalGame = {
        ...updatedGame,
        currentDoor: officerName,
        characterPositions: updatedGame.characterPositions.map((c: any) => (
          c.name === officerName ? { ...c, path: 'front-door', direction: 'n' } : c
        )),
        forcedConversation: allClearConvo ? { characterName: officerName, conversation: allClearConvo } : undefined
      }

      mainWindow?.webContents.send('update-game-data', finalGame)
    }
  })
}

const fight = (game, ...args) => {
  console.log(args)
}

ipcMain.handle('sleep', (_e, data) => {
  data.days.push([])
  data.doorKnocksToday = 0
  mainWindow?.webContents.send('update-game-data', data)
})

// Plant a seed in an empty garden bed
ipcMain.handle('plant-seed', (_e, game, bedIndex: number, seedId: string) => {
  const seed = seedItems[seedId]
  if (!seed) return null

  const plantType = plantTypes[seed.grows]
  if (!plantType) return null

  if (game.garden[bedIndex] !== null && game.garden[bedIndex] !== undefined) return null
  if (!hasItem(game, PLAYER_INVENTORY_ID, seedId, 1)) return null

  const gameAfterSeedRemoved = removeItem(game, PLAYER_INVENTORY_ID, seedId, 1)

  const garden = [...gameAfterSeedRemoved.garden]
  garden[bedIndex] = {
    plantId: seed.grows,
    plantedOnDay: gameAfterSeedRemoved.days.length - 1,
    harvestAmount: randomBetween(plantType.minHarvest, plantType.maxHarvest)
  }

  const gameResult = addDayAction(gameAfterSeedRemoved, playerActions.plant)

  return { ...gameResult, garden }
})

// Move items between two inventories (e.g. player <-> a chest)
ipcMain.handle('transfer-item', (_e, game, fromOwnerId: string, toOwnerId: string, itemId: string, quantity: number) => {
  return transferItem(game, fromOwnerId, toOwnerId, itemId, quantity)
})

// Harvest a fully-grown garden bed
ipcMain.handle('harvest-plant', (_e, game, bedIndex: number) => {
  const bed = game.garden[bedIndex]
  if (!bed) return null

  const plantType = plantTypes[bed.plantId]
  if (!plantType) return null

  const currentDay = game.days.length - 1
  const daysGrown = currentDay - bed.plantedOnDay

  if (daysGrown < plantType.daysToGrow) return null

  const garden = [...game.garden]
  garden[bedIndex] = null

  const updatedGame = addItem({ ...game, garden }, PLAYER_INVENTORY_ID, bed.plantId, bed.harvestAmount)

  return {
    game: updatedGame,
    plantName: plantType.name,
    amount: bed.harvestAmount
  }
})

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
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    width: 1920,
    height: 1080,
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
