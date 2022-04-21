const { app, BrowserWindow } = require('electron')
const path = require('path')
const { ipcMain } = require('electron');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { dialog } = require('electron');

var gPort;

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  win.loadFile('index.html');

  ipcMain.on('request-port-open', (event, arg) => {
    win.webContents.send('open-port', arg);
  });

  ipcMain.on( "setPort", ( event, globalPort ) => {
    gPort = globalPort;
    win.webContents.send( "port-val", gPort);
  });
}
var win2;
function createPopout(callback) {
  win2 = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  win2.loadFile('popout.html');

  win2.webContents.on('did-finish-load', function () {
    if (typeof callback == 'function') {
      callback();
    }
  });

  ipcMain.on( "getPort", () => {
    win2.webContents.send( "popout-port", gPort);
  });

  win2.on('close', () => {
    win2 = null;
  });

  win2.on('closed', () => {
    win2 = null;
  });
}

ipcMain.on("popout", () => {
  if(!win2){
    createPopout(function(){
          win2.show();    
    });
  } else{
      win2.show();    
  }
})

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

ipcMain.on("show-dialog", (event, recordedData) => {
  var options = {
    title : "Select File Location", 
  
    properties: ['openDirectory']
  }
  var newPath, oldPath;
  dialog.showOpenDialog(options)
    .then(filePaths => {
        oldPath = String(filePaths.filePaths)
        newPath = oldPath.replace("undefined", "")
        newPath = newPath + "\\data.csv";
        const csvWriter = createCsvWriter({
            path: newPath,
            header: [
                {id: 'time', title: 'Time'},
                {id: 'value', title: 'Value'},
            ]
        });
  
        csvWriter
            .writeRecords(recordedData)
            .then(()=> console.log('The CSV file was written successfully'));
    })
})


