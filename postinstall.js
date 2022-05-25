const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// TODO: Update BAILEYS_HASH automatically
BAILEYS_HASH = '211a899ed4f56d85fc1acbb9439de8865ac4d777';

// Check if this is clone
if (fs.existsSync(path.resolve(__dirname, './docs/'))) {
	console.log('[i] Npm package detected, skipping post-install.');
	process.exit(0);
}

// spawnSync options
let opts = {
	cwd: __dirname,
	stdio: ['pipe', process.stdio, process.stderr]
};
let baileysOpts = {...opts, cwd: path.resolve(__dirname, './Baileys/')};

// The commands
let cmds = [
	{
		msg: "[i] Initializing Git",
		cmd: ['git', 'init'], opt: opts
	},
	{
		msg: "[i] Adding Baileys submodule",
		cmd: ['git', 'submodule', 'add', 'https://github.com/adiwajshing/Baileys.git', 'Baileys'],
		opt: opts
	},
	{
		msg: "Checking out submodule",
		cmd: ['git', 'checkout', BAILEYS_HASH], opt: baileysOpts
	},
	{
		msg: "Compiling Baileys...",
		cmd: ['npm', 'install', '-D'], opt: baileysOpts
	},
	{
		msg: "Compiling fabuya...",
		cmd: ['npx', 'tsc'], opt: opts
	}
];

for (const cmd of cmds) {
	console.log(cmd.msg);
	let { status } = spawnSync(cmd.cmd.shift(), cmd.cmd, cmd.opt);
	if (status != 0) throw "Error on postinstall";
}
