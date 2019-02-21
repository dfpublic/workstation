class Module {
    constructor(identifier, mod) {
        this.identifier = identifier;
        this.displayname = mod.displayname;
        this.type = mod.type;
        this.url = mod.url;
        this.data_partition = mod.data_partition;
        this.preload = mod.preload;
    }
}
module.exports = Module;