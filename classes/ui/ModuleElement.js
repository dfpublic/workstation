const Module = require('../general/Module');
const { ipcRenderer, remote } = require('electron');
class ModuleElement {
    /**
     * @param {Document} document
     * @param {Module} _module
     * @param {string} identifier
     * @param {string} module_element_id
     * @param {{log: Function, debug: boolean}} options
     */
    constructor(document, _module, identifier, module_element_id, options) {
        this.document = document;
        this.module_identifier = identifier;
        this._module = _module;
        this.module_element = this.document.createElement('webview');

        this.module_element_id = module_element_id;
        this.options = options;
        this.init();
    }
    debugLog(text) {
        this.options.log(text);
    }
    init() {
        let { module_element } = this;
        this._initModuleCore(module_element);
        this._initModuleStyles(module_element);
        this._initModuleHooks(module_element);
        this._initModulePermissions(module_element);
        this._initModuleSource(module_element);
    }
    /**
     * @param {HTMLElement} module_element
     */
    _initModuleCore(module_element) {
        let { _module, module_element_id, options } = this;
        let system_module = _module;
        module_element.id = module_element_id; //Initialize handle
        let data_partition = system_module.data_partition ? system_module.data_partition : 'global';
        if (_module.identifier === 'whatsapp') {
            module_element.setAttribute('preload', `preload/whatsapp.js`); //Clear the whatsapp cache
        }
        module_element.setAttribute('partition', `persist:${data_partition}`); //Set the data partition
    }
    /**
     * @param {HTMLElement} module_element
     */
    _initModuleStyles(module_element) {
        module_element.classList.add('module-element');
    }
    /**
     * @param {HTMLElement} module_element
     */
    _initModuleHooks(module_element) {
        module_element.addEventListener('focus', function () {
            module_element.getWebContents().on('before-input-event', (event, input) => {
                if (input.type !== 'keyDown') {
                    return;
                }

                // Create a fake KeyboardEvent from the data provided
                const emulatedKeyboardEvent = new KeyboardEvent('keydown', {
                    code: input.code,
                    key: input.key,
                    shiftKey: input.shift,
                    altKey: input.alt,
                    ctrlKey: input.control,
                    metaKey: input.meta,
                    repeat: input.isAutoRepeat,
                });

                // do something with the event as before
            });
        });
    }
    /**
     * @param {HTMLElement} module_element
     */
    _initModulePermissions(module_element) {
        let self = this;
        //Open links in new window
        module_element.addEventListener('new-window', function (event) {
            ipcRenderer.send('new-window', { url: event.url });
        });

        //Request to download files
        module_element.addEventListener('permission-request', function (event) {
            switch (event.permission) {
                case 'download':
                    event.request.allow();
                    break;
            }
        });
    }

    /**
     * @param {HTMLElement} module_element
     */
    _initModuleSource(module_element) {
        let self = this;
        let { _module, module_element_id, document } = this;
        let system_module = _module;
        let url_target = system_module.url;
        // let loaded = false;
        // module_element.addEventListener('did-start-loading', function (event) {
        //     if(!loaded) {
        //         self.debugLog(`loading started for ${self.module_identifier}`);
        //         var wv = document.getElementById('module_whatsapp');
        //         wv.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.106 Safari/537.36');
        //         wv.reload();
        //         loaded = true;
        //     }
        // });
        module_element.setAttribute('src', url_target);
        module_element.setAttribute(
            'useragent',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.106 Safari/537.36'
        );
    }

    getHTMLElement() {
        return this.module_element;
    }
    refresh() {
        let self = this;
        let module_element_id = self.module_element_id;
        let module_element = self.document.getElementById(module_element_id);
        module_element.reload();
    }
    redirectLogsToMainConsole() {
        let { module_element } = this;
        module_element.addEventListener('console-message', (e) => {
            //Redirect logs to main console
            console.log('MODULE DEBUG LOG:', e.message);
        });
    }
}
module.exports = ModuleElement;
