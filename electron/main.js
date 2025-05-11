"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// electron/main.ts
var electron_1 = require("electron");
var path_1 = require("path");
var mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    var url = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : "file://".concat(path_1.join(__dirname, '../out/index.html'));
    mainWindow.loadURL(url);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
