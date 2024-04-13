import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path, { basename } from 'path';

import cp from "child_process"
import process from "process"

const appPath = app.getAppPath();
const extrasPath = path.join(appPath, 'extras')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const tempPath = app.getPath("temp");
let mainWindow
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    autoHideMenuBar: true
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
function openFile(cuda) {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'TSAC', extensions: ['tsac'] },
    ]
  }).then(function (response) {
    if (!response.canceled) {
      process.chdir(extrasPath);
      const fileName = basename(response.filePaths[0]);
      const tempFilePath = `${path.join(tempPath, fileName)}.wav`;
      console.log(tempFilePath);
      mainWindow.webContents.send('toRender', {
        event: 'start-transcoding'
      });
      // console.log(`tsac.exe ${cuda ? '--cuda' : ''} d ${response.filePaths[0]} ${tempFilePath}`)
      // return
      cp.exec(`tsac.exe ${cuda ? '--cuda' : ''} d ${response.filePaths[0]} ${tempFilePath}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          mainWindow.webContents.send('toRender', {
            event: 'error',
            msg: err.message
          });
          return;
        }
        console.log('COMPLETE', stdout);
        mainWindow.webContents.send('toRender', {
          event: 'completed',
          name: fileName,
          wav: tempFilePath
        });
      });

    } else {
      mainWindow.webContents.send('toRender', {
        event: 'cancel'
      });
      console.log("no file selected");
    }
  });
}

ipcMain.on('toMain', (event, arg) => {
  console.log(`The temp path is: ${app.getPath("temp")}`)
  const { event: eventName, cuda } = arg;
  openFile(cuda);
  event.reply('asynchronous-reply', 'pong')
})

