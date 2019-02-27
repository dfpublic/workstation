const electron = require('electron');
const defaultMenu = require('electron-default-menu');
const { MenuItem, Menu, app, BrowserWindow, ipcMain, session, shell, remote } = electron;
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
    let user_data_path = system.getSystemConfigs().user_data_path;
    app.setPath('userData', user_data_path);

    //Create menus
    // const menu = defaultMenu(app, shell);

    // const menu = new Menu()

    // menu.append(new MenuItem({
    //     label: 'Refresh',
    //     accelerator: 'CmdOrCtrl+R',
    //     click: () => { console.log('time to print stuff') }
    // }))
    const menuTemplate = [
        {
            label: "Electron",
            submenu: [
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => { app.quit(); }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'Command+Z',
                    selector: 'undo:'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+Command+Z',
                    selector: 'redo:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'Command+X',
                    selector: 'cut:'
                },
                {
                    label: 'Copy',
                    accelerator: 'Command+C',
                    selector: 'copy:'
                },
                {
                    label: 'Paste',
                    accelerator: 'Command+V',
                    selector: 'paste:'
                },
                {
                    label: 'Select All',
                    accelerator: 'Command+A',
                    selector: 'selectAll:'
                },
            ]
        },
        {
            label: "Options",
            submenu: [
                {
                    label: 'Reload current module',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => { raise_event(win, 'reload-module') }
                },
                {
                    label: 'Reload all modules',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => { raise_event(win, 'reload-all-modules') }
                },

                {
                    label: 'Next module',
                    accelerator: 'Ctrl+tab',
                    click: () => { raise_event(win, 'switch-next-module') }
                },

                {
                    label: 'Previous module',
                    accelerator: 'Ctrl+Shift+Tab',
                    click: () => { raise_event(win, 'switch-previous-module') }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
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
        raise_event(win, 'ui_init');
    });

    ipcMain.on('main_get_configs', () => {
        let config = system.getConfigRaw();
        let module_data = JSON.stringify(config.modules);
        let debug = {
            user_data_path: system.getSystemConfigs().user_data_path
        }
        // let modules = system.getConfig().getModules();
        let default_module = system.getDefaultModule();
        raise_event(win, 'ui_configs_received', { config, module_data, default_module, debug });
    });

    ipcMain.on('new-window', (sender, data) => {
        let { url } = data;
        let openurl = require('openurl');
        openurl.open(url, () => { });
    });
}

/**
 * Init main process events
 * @param {BrowserWindow} win 
 * @param {string} event_name
 */
function raise_event(win, event_name, data = undefined) {
    win.webContents.send(event_name, data);
}
app.on('ready', main)