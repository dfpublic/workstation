let fs = require('fs');
let path = require('path');
let pkg = require('./package.json');
let Classes = require('./classes/index');
let Module = Classes.general.Module;

let System = module.exports;
System.current_version = 2;
System.classes = Classes;
System.package = {
    name: pkg.name
}
System.init = function () {
    let config_name = this.getCurrentConfigName();
    System.initConfig(config_name);
    System.upgrade(config_name);
}
System.getCurrentConfigName = function () {
    let config_name = (process.env.CONFIG && (process.env.CONFIG !== 'undefined')) ? process.env.CONFIG : 'user_default';
    return config_name;
}
System.initConfig = function (config_name) {
    //Test config loading. If not able to load, resort to default config
    let config = System.getConfig(config_name);
}
System.getConfigFilename = function () {
    let sample_config_filename = 'modules.json';
    let sample_config_filepath = path.resolve(path.join(__dirname, 'config', sample_config_filename));
    let config_name = System.getCurrentConfigName();
    let selected_config_filename = `${config_name}.json`;
    let selected_config_filepath = null;
    // switch (process.env.CONFIG) {

    selected_config_filepath = path.resolve(path.join(__dirname, 'config', selected_config_filename));
    if (!fs.existsSync(selected_config_filepath)) {
        fs.copyFileSync(sample_config_filepath, selected_config_filepath);
        alert(`New configuration file created!\n\n${selected_config_filepath}\n\nModify this file to set up your own configuration!`);
    };
    return selected_config_filepath;
}

System.getDefaultModule = function () {
    let config_name = System.getCurrentConfigName();
    let currentConfig = System.getConfig();
    if (currentConfig === null) {
        return alert(`Failed to load default module for config ${config_name}`);
    }
    return Object.keys(currentConfig.getModules())[0];
}
System.upgrade = function (config_name) {
    let config = this.getConfig(config_name);
    if (!config.version) {
        let modules = Object.assign({}, config); //make a copy
        config = {
            version: 1,
            modules
        };
        System.saveConfig(config_name, config);
    }
    else {
        if (config.version < 2) {
            config.version = 2;
            config.display_name = config_name;
            System.saveConfig(config_name, config);
        }
    }
}
/**
 * @param {string} [config_name]
 * @returns {ConfigRaw}
 */
System.getConfigRaw = function (config_name) {
    if (!config_name) {
        config_name = System.getCurrentConfigName();
    }
    let filepath = path.resolve(path.join(__dirname, '/config', `${config_name}.json`));

    if(!fs.existsSync(filepath)) {
        //Failed to load the configuration, so create new profile
        let sample_config_filename = 'modules.json';
        let sample_config_filepath = path.resolve(path.join(__dirname, 'config', sample_config_filename));

        let selected_config_filename = `${config_name}.json`;
        let selected_config_filepath = null;

        selected_config_filepath = path.resolve(path.join(__dirname, 'config', selected_config_filename));
        if (!fs.existsSync(selected_config_filepath)) {
            fs.copyFileSync(sample_config_filepath, selected_config_filepath);
        };
    }
    let contents = fs.readFileSync(filepath);
    let config_data = JSON.parse(contents.toString());
    return config_data;
}
System.getConfig = function (config_name) {
    let config_data = System.getConfigRaw(config_name);
    let config = {
        getDisplayName: function () {
            return this.display_name;
        },
        getModules: function () {
            let module_configs = this.modules;
            let modules = Object.keys(module_configs).reduce((last, identifier, idx) => {
                let module_config = module_configs[identifier];
                let mod = new Module(identifier, module_config);
                last[identifier] = mod;
                return last;
            }, {});
            return modules;
        }
    }
    config = Object.assign(config, config_data);
    return config;
}

System.saveConfig = function (config_name, config_data) {
    let filepath = path.resolve(path.join(__dirname, '/config', `${config_name}.json`));
    fs.writeFileSync(filepath, JSON.stringify(config_data, null, 2));
}

/**
 * @typedef ConfigRaw
 * @property {string} display_name
 * @property {Array<ModuleConfig>} modules
 */
/**
 * @typedef ModuleConfiig
 * @property {string} displayname
 * @property {string} type
 * @property {string} url
 * @property {string} data_partition
 * @property {Boolean} preload
 */