const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url');
const { ipcMain } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    }
  })
  win.loadFile('index.html')

  ipcMain.on('request-port-open', (event, arg) => {
    // Request to update the label in the renderer process of the second window
    win.webContents.send('open-port', arg);
  });
}

app.whenReady().then(() => {
  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

