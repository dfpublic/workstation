const { exec } = require('child_process');
const config = process.argv[2];
const config_name = config ? config : 'user_default';
console.log(`Starting workstation with ${config_name} configuration.`);
const path = require('path');
const electron_path = path.resolve(path.join(__dirname, '/node_modules/.bin/electron'));
let cmd = `CONFIG=${config_name} ${electron_path} .`;
console.log(cmd);
exec(cmd);