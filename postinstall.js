const fs = require('fs');
const { spawnSync } = require('child_process');

// Initialize git submodule
spawnSync('git', ['submodule',  'update', '--init', '-N', 'Baileys']);
spawnSync('npm', ['install', '-D', '--prefix ./Baileys']);

// Move directories
fs.renameSync('./Baileys/lib', './baileys-lib');

fs.renameSync('./Baileys/WAProto', './WAProto');
fs.renameSync('./Baileys/WASignalGroup', './WASignalGroup');
