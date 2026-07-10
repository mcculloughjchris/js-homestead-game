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

const savePath = path.join(app.getPath("appData"), "homesteading")

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('trigger-new-game', async (e, name) => {
  const data = {
    id: randomUUID(),
    name: name,
    tutorialed: false,
    hunger: 100,
    thirst: 100,
    money: 100,
    day: 0,
    currentLocation: "lroom0",
    currentDirection: "s"
  }

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

ipcMain.handle('save-game', async (e, data) => {
  console.log(data)
})

ipcMain.handle('load-game', async (e, id) => {
  const filePath = path.join(savePath, `${id}.json`)

  const file = await fs.promises.readFile(filePath, { encoding: null })
  const text = new TextDecoder('utf-8').decode(file)
  const data = JSON.parse(text)

  return data
})

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

ipcMain.handle('keypress', async (e, data) => {
  const { key, game } = data
  const { currentLocation, currentDirection } = game

  const room = roomValues[currentLocation]

  let action = ""

  if (key === "w") { // player wants to move foward
    let newLocation = null

    if (room.boundary !== undefined) {
      if (room.boundary.indexOf(currentDirection) === -1) {
        newLocation = oneSpaceForward(currentLocation, currentDirection)
      }
    } else {
      newLocation = oneSpaceForward(currentLocation, currentDirection)
    }

    if (newLocation !== null) {
      return {
        newLocation
      }
    }
  }

  if (key === "s") { // player wants to move backward
    let newLocation = null

    if (room.boundary !== undefined) {
      if (room.boundary.indexOf(oppositeOf(currentDirection)) === 1) {
        newLocation = oneSpaceBackward(currentLocation, currentDirection)
      }
    } else {
      newLocation = oneSpaceBackward(currentLocation, currentDirection)
    }

    if (newLocation !== null) {
      return {
        newLocation
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
