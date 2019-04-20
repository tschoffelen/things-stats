const { app, BrowserWindow, ipcMain } = require('electron')
const sqlite3 = require('sqlite3')
const path = require('path')
const os = require('os')

let win

const dbPath = os.homedir() +
  '/Library/Containers/com.culturedcode.ThingsMac/Data/Library/' +
  'Application Support/Cultured Code/Things/Things.sqlite3'

const getTasks = (event, arg) => {
  const db = new sqlite3.Database(path.resolve(dbPath), (err) => {
    if (err) {
      event.sender.send('query-error', err.message)
      return
    }

    const output = []
    db.serialize(() => {
      db.each(arg, (err, row) => {
        if (err) {
          event.sender.send('query-error', err.message)
          return
        }
        output.push(row)
      })
    })

    db.close()

    setTimeout(() => {
      event.sender.send('query-rows', output)
    }, 200)
  })
}

ipcMain.on('query', getTasks)

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 600,
    height: 500,
    title: 'Things Stats',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#212225',
    darkTheme: true,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('src/web/index.html')

  // Open the DevTools.
  //win.webContents.openDevTools({ mode: 'detach' })

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
