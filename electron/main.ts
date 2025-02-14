import { app, BrowserWindow, desktopCapturer, ipcMain } from 'electron';

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'fs';
import os from 'os';

// TODO: Enable Wayland support on Linux
// if (process.platform === 'linux') {
//   // Enable Wayland support
//   app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');
//   app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

//   // Additional Wayland-specific switches
//   app.commandLine.appendSwitch('use-gl', 'desktop');
//   app.commandLine.appendSwitch('enable-webrtc-pipewire-capturer');
// }

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;
let studio: BrowserWindow | null;
let floatingWebCam: BrowserWindow | null;
function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 500,
    maxHeight: 600,
    minWidth: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    focusable: true,
    resizable: true,
    movable: true,
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'screen-saver', 1);
  
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    // Development mode
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // Production mode
    const indexPath = path.join(RENDERER_DIST, 'index.html');
    win.loadFile(indexPath);
  }
}

// Create the secondary windows (studio and webcam) on demand
function createSecondaryWindows() {
  if (!studio) {
    studio = new BrowserWindow({
      width: 400,
      height: 250,
      minHeight: 70,
      maxHeight: 400,
      minWidth: 300,
      maxWidth: 400,
      frame: false,
      transparent: true,
      alwaysOnTop: false,
      focusable: true,
      resizable: true,
      movable: true,
      icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        devTools: true,
        preload: path.join(__dirname, 'preload.mjs'),
      },
    });
    studio.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    studio.setAlwaysOnTop(true, 'screen-saver', 1);
    studio.webContents.on('did-finish-load', () => {
      studio?.webContents.send('main-process-message', new Date().toLocaleString());
    });
    if (VITE_DEV_SERVER_URL) {
      studio.loadURL(`${VITE_DEV_SERVER_URL}/studio.html`);
    } else {
      const studioPath = path.join(RENDERER_DIST, 'studio.html');
      studio.loadFile(studioPath);
    }
  }

  if (!floatingWebCam) {
    floatingWebCam = new BrowserWindow({
      width: 200,
      height: 200,
      minHeight: 100,
      maxHeight: 400,
      minWidth: 100,
      maxWidth: 400,
      frame: false,
      transparent: true,
      alwaysOnTop: false,
      focusable: true,
      resizable: true,
      movable: true,
      icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        devTools: true,
        preload: path.join(__dirname, 'preload.mjs'),
      },
    });
    floatingWebCam.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    floatingWebCam.setAlwaysOnTop(true, 'screen-saver', 1);
    floatingWebCam.webContents.on('did-finish-load', () => {
      floatingWebCam?.webContents.send('main-process-message', new Date().toLocaleString());
    });
    if (VITE_DEV_SERVER_URL) {
      floatingWebCam.loadURL(`${VITE_DEV_SERVER_URL}/webcam.html`);
    } else {
      const webcamPath = path.join(RENDERER_DIST, 'webcam.html');
      floatingWebCam.loadFile(webcamPath);
    }
  }
}

ipcMain.on('login-success', () => {
  createSecondaryWindows();
});

ipcMain.on('logout-success', () => {
  if (studio) {
    studio.close();
    studio = null;
  }
  if (floatingWebCam) {
    floatingWebCam.close();
    floatingWebCam = null;
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
    studio = null;
    floatingWebCam = null;
  }
});

ipcMain.on('closeApp', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
    studio = null;
    floatingWebCam = null;
  }
});

ipcMain.handle('getSources', async () => {
  const data = await desktopCapturer.getSources({
    thumbnailSize: { height: 100, width: 150 },
    fetchWindowIcons: true,
    types: ['window', 'screen'],
  });

  return data;
});

ipcMain.on('media-sources', (_event, payload) => {
  studio?.webContents.send('profile-received', payload);
});
ipcMain.on('resize-studio', (_event, payload) => {
  if (payload.shrink) {
    studio?.setSize(400, 100);
  }
  if (!payload.shrink) {
    studio?.setSize(400, 250);
  }
});
ipcMain.on('hide-plugin', (_event, payload) => {
  win?.webContents.send('hide-plugin', payload);
});

ipcMain.handle(
  'writeVideoChunk',
  async (_event, arrayBuffer: ArrayBuffer, fileName: string) => {
    try {
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(os.homedir(), 'Downloads', fileName);
      fs.appendFileSync(filePath, buffer);
      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
);

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
