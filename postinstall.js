const fs = require('fs');
const { spawnSync } = require('child_process');

if (!fs.existsSync(__dirname + '/docs')) {
	console.log('[i] Npm package detected, skipping post-install.');
	process.exit(0);
}

// Initialize git submodule
let opts = {stdio: ['pipe', process.stdio, process.stderr]}
console.log('[i] Updating submodule');
let res1 = spawnSync('git', ['submodule',  'update', '--init', '-N', 'Baileys'], opts);
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
