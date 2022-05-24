const fs = require('fs');
const { spawnSync } = require('child_process');

// TODO: Update BAILEYS_HASH automatically
BAILEYS_HASH = '211a899ed4f56d85fc1acbb9439de8865ac4d777';

if (!fs.existsSync(__dirname + '/docs')) {
	console.log('[i] Npm package detected, skipping post-install.');
	process.exit(0);
}

// Initialize git submodule
let opts = {
	cwd: __dirname,
	stdio: ['pipe', process.stdio, process.stderr]
};

console.log('[i] Initializing Git');
spawnSync('git', ['init'], opts);
spawnSync('git', ['submodule', 'add', 'https://github.com/adiwajshing/Baileys.git', 'Baileys'], opts);
console.log('[i] Updating submodule');
let res1 = spawnSync('git', ['update-index',  '--cacheinfo 160000', BAILEYS_HASH, 'Baileys'], opts);
console.log('[i] Installing submodule dependencies on', __dirname + '/Baileys');
let res2 = spawnSync('npm', ['install', '-D', '--prefix', __dirname + '/Baileys'], opts);
console.dir(res2)

// Move directories
let sd = (s, d) => ({source: s, dest: d});
let dirs = [
	sd(__dirname + '/Baileys/lib', __dirname + '/baileys-lib'),
	sd(__dirname + '/Baileys/WAProto', __dirname + '/WAProto'),
	sd(__dirname + '/Baileys/WASignalGroup', __dirname + '/WASignalGroup'),
]

for (const d of dirs) {
	fs.rmSync(d.dest, {force: true, recursive: true});
	fs.renameSync(d.source, d.dest);
}
