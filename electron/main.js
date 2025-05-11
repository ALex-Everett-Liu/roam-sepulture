"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// electron/main.ts
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
            webSecurity: false,
            allowRunningInsecureContent: false
        }
    });

    // Force development mode for testing
    const url = 'http://localhost:3000';
    console.log('Loading URL:', url);

    // Enable DevTools for debugging
    mainWindow.webContents.openDevTools();

    mainWindow.loadURL(url);

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load URL:', errorCode, errorDescription);
        
        // Add retry logic after 3 seconds
        setTimeout(() => {
            console.log('Retrying to load URL:', url);
            mainWindow.loadURL(url);
        }, 3000);
    });

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
