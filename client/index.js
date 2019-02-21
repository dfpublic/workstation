const { ipcRenderer, remote } = require('electron');
const { ModuleManager } = require('./../classes/ui/index');

ipcRenderer.on('ui_init', () => {
    
    ipcRenderer.send('main_get_configs');
    // window.location.href = 'https://gmail.com'
});

ipcRenderer.on('ui_configs_received', (sender, data) => {
    let { config, module_data, default_module } = data;
    let modules = JSON.parse(module_data);
    let module_manager = new ModuleManager(document, modules, { log: console.log });
    console.log(data);
    document.title = `Workstation (${config.display_name})`;

    /**
 * Generates all the ui elements for the navigation menu
 */
    function ui_generate_menuitems() {
        let menu_items = {};
        for (var mod_idx in modules) {
            let mod = modules[mod_idx];
            //Generate the menu items
            let menu_item = module_manager.createActivationButton(mod.identifier, mod.displayname);
            menu_items[mod.identifier] = menu_item;
        }
        return menu_items;
    }
    function init_app_nav() {
        //do work
        let app_nav = document.getElementById("nav");
        let menu_items = ui_generate_menuitems();
        Object.keys(menu_items).map(module_identifier => {
            let menu_item = menu_items[module_identifier];
            app_nav.append(menu_item);
        });
    }
    init_app_nav();
    module_manager.setModuleActive(default_module);
    module_manager.preloadModules();
})
ipcRenderer.send('main_init');