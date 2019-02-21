const electron = require('electron');
const { app, BrowserWindow, ipcMain, session } = electron;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.106 Safari/537.36';
const DEBUG = process.env.DEBUG === "true" ? true : false;
const system = require('./system');
const path = require('path');
function main() {
    //Set the global user agent
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = USER_AGENT;
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
    // Set the configurations
    let user_data_path = path.resolve(path.join(__dirname,`user_data/${system.getCurrentConfigName()}`))
    app.setPath('userData', user_data_path);
    // Create the browser window.
    let win = new BrowserWindow({ width: 800, height: 600 })
    win.maximize();
    // and load the index.html of the app.
    win.loadFile('client/index.html')

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    DEBUG ? win.openDevTools({ mode: 'right' }) : null;
    init(win);
}
/**
 * Init main process events
 * @param {BrowserWindow} win 
 */
function init(win) {
    ipcMain.on('main_init', () => {
        win.webContents.send('ui_init');
    });

    ipcMain.on('main_get_configs', () => {
        let config = system.getConfigRaw();
        let module_data = JSON.stringify(config.modules);
        // let modules = system.getConfig().getModules();
        let default_module = system.getDefaultModule();
        win.webContents.send('ui_configs_received', { config, module_data, default_module })
    });
}
app.on('ready', main)