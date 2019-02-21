const { remote } = require('electron');
const path = require('path');

const webContents = remote.getCurrentWebContents();
const { session } = webContents;

window.onload = () => {
    const title = document.querySelector('.window-title').innerHTML;
    if (title && title.includes('Google Chrome 36+')) {

        session.flushStorageData();
        session.clearStorageData({
            storages: ['serviceworkers'],
        });
        window.location.reload();
    }
};