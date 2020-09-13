'use strict';

// This script loads and displays the interface to the user.
// The initial script should've initialised everything necessary for this script to just "work".

const { app, BrowserWindow, Tray, screen } = require('electron');


// Initialise IPC calls (for comms. between renderer/main processes)
const ipcMain = require('./ipc');
ipcMain.init();

function CreateWindow() {
    // Create the main window for user interaction.
    console.log("[INTERFACE] Creating interface window.");
    const { screenWidth, screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    
    const mainWindow = new BrowserWindow({
        width: screenWidth / 4,
        height: screenHeight / 4,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.setBackgroundColor('#36393F')
    mainWindow.setMenuBarVisibility(false)

    console.log("[INTERFACE] Loading client display (you should now see the UI).");

    mainWindow.loadFile("./app/html/index.html");

    ipcMain.setWindow(mainWindow);
}

// Function to run when the application is declared "ready" by Electron.
function AppReady() {
    console.log("[INTERFACE] Electron application is now ready.");
    CreateWindow();
}

// Add a handler to Electron's readiness event.
app.whenReady().then(AppReady);