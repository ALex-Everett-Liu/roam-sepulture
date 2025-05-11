"use strict";
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Print environment info for debugging
console.log('Process env NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // Load the HTML file directly
    const htmlPath = path.join(__dirname, '../public/basic.html');
    console.log('Loading HTML file:', htmlPath);
    mainWindow.loadFile(htmlPath);

    // Enable DevTools for debugging
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
