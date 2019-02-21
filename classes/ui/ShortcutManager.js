class ShortcutManager {
    /**
     * 
     * @param {typeof import("./../../node_modules/@types/nw.gui/index")} gui 
     * @param {Document} document
     * @param {{log: function}} options
     */
    constructor(gui, document, options) {
        this.gui = gui;
        this.document = document;
        this.options = options;
        this.commands = {};
    }
    debugLog(text) {
        this.options.log(text);
    }

    registerHotKey(hotkey, handler) {
        let self = this;
        let config = self.parseHotkey(hotkey);
        let command_code = self.getCommandCode(config.opcode, config.key);
        self.commands[command_code] = handler;
        self.document.onkeydown = function (e) {
            self.processEvent(e);
        }
        //DEPRECATED: Global hotkey register
        // let options = {
        //     key: key,
        //     active: function () {
        //         handler();
        //     },
        //     failed: function (msg) {
        //         self.debugLog(msg);
        //     }
        // };
        // let shortcut = new self.gui.Shortcut(options);
        // self.gui.App.registerGlobalHotKey(shortcut);
        // self.gui.App.unregisterGlobalHotKey(shortcut);
        // self.document.addEventListener('unload', function (e) {
        //     self.debugLog('loading events');
        //     self.gui.App.unregisterGlobalHotKey(shortcut);
        //     e.preventDefault();
        // });
    }

    /**
     * @param {string} hotkey 
     */
    parseHotkey(hotkey) {
        let self = this;
        let tokens = hotkey.split('+').map(item => item.trim().toLowerCase());
        let map = tokens.reduce((last, token, idx) => {
            if (self.isModifierKey(token)) {
                last.modifiers.push(token);
            }
            else {
                last.keys.push(token);
            }
            return last;
        }, { modifiers: [], keys: [] });

        let { modifiers, keys } = map;
        if(keys.length > 1) { //May need to be reworked to do all keys as a bit stream instead of individual key press
            throw new Error(`Cannot have more than key as part of hotkey command.`);
        }
        let opcode = self.modifiersGetOpCode(modifiers);
        let key = keys[0];
        return { opcode, key };
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    handleKeyPress(e) {

    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    processEvent(e) {
        let self = this;
        let key = ('' + e.key).toLowerCase();
        let { shiftKey, ctrlKey, altKey, metaKey } = e;
        let opcode = self.getOpCode(shiftKey, ctrlKey, altKey, metaKey);
        let command_code = self.getCommandCode(opcode, key);
        let command = self.commands[command_code];
        if((typeof command) === 'function') {
            command();
        }
    }
    isModifierKey(key) {
        if (key === 'command' || key === 'ctrl' || key === 'shift' || key === 'alt' || key === 'meta') {
            return true;
        }
        return false;
    }
    /**
     * Gets a command code from the opcode and keypress
     * @param {string} opcode 
     * @param {string} key 
     */
    getCommandCode(opcode, key) {
        return `${opcode}${key}`;
    }
    /**
     * Gets the opcode for a combination of modifier keys
     * @param {Boolean} shiftKey 
     * @param {Boolean} ctrlKey 
     * @param {Boolean} altKey 
     * @param {Boolean} metaKey 
     */
    getOpCode(shiftKey, ctrlKey, altKey, metaKey) {
        let opcode = [shiftKey, ctrlKey, altKey, metaKey].reduce((last, cur, idx) => {
            last += cur ? '1' : '0';
            return last;
        }, "")
        return opcode;
    }
    /**
     * Converts an array of modifiers to opcode
     * @param {Array<string>} modifiers 
     */
    modifiersGetOpCode(modifiers) {
        let self = this;
        let shiftKey = false;
        let ctrlKey = false;
        let altKey = false;
        let metaKey = false;
        for (let modifier of modifiers) {
            if (modifier === 'shift') {
                shiftKey = true;
            }
            if (modifier === 'ctrl') {
                ctrlKey = true;
            }
            if (modifier === 'alt') {
                altKey = true;
            }
            if (modifier === 'meta' || modifier === 'command') {
                metaKey = true;
            }
        }
        return self.getOpCode(shiftKey, ctrlKey, altKey, metaKey);
    }
}
module.exports = ShortcutManager;