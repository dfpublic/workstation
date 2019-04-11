const { remote } = require('electron');
const path = require('path');

const webContents = remote.getCurrentWebContents();
const { session } = webContents;

window.onload = () => {
    let watched_container = document.querySelector('.landing-title');
    if(watched_container) {
        const title = watched_container.innerHTML;
        if (title && title.includes('Google Chrome 36+')) {
            session.flushStorageData();
            session.clearStorageData({
                storages: ['serviceworkers'],
            });
            window.location.reload();
        }
        //If there is web content found regarding a request for Google Chrome 36+, then the page is assumed to have successfully loaded.
    }
    else {
        console.error('Failed to load watched container contents. Refer to DevTools for module to fix this issue.');
    }
};