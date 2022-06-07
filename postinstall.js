const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// TODO: Update BAILEYS_HASH automatically
BAILEYS_HASH = '3eeded66b22c97e52398d1cafaf81bf185bf8cd5';

// GitHub Action goodbye.
if (process.env.GITHUB_ACTIONS) {
        console.log('[i] GitHub Action detected, skipping post-install.');
        process.exit(0);
}
let isnpm = fs.existsSync(path.resolve(__dirname, './dist/'));
let isgithttps = fs.existsSync(path.resolve(__dirname, './docs/'));
let isbaileysinited = fs.existsSync(path.resolve(__dirname, './Baileys/README.md'));

if (isnpm) {
	// Npm package will have pre compiled library
	console.log("[i] npm install detected. Perhaps your ./dist/ folder not removed?");
	process.exit(0);
}

// spawnSync options
let opts = {
        cwd: __dirname,
        stdio: ['pipe', process.stdio, process.stderr]
};
let baileysOpts = {...opts, cwd: path.resolve(__dirname, './Baileys/')};

// The commands
let cmds = [];
cmds.push({
        msg: "[i] Initializing Git",
        cmd: ['git', 'init'], opt: opts
});

if (isgithttps && !isbaileysinited) {
	if (fs.existsSync(path.join(__dirname, './Baileys/'))) {
		fs.rmSync(path.join(__dirname, './Baileys/'), { force: true, recursive: true });
	}

        cmds.push({
                msg: "[i] Adding Baileys submodule",
                cmd: ['git', 'submodule', 'add', '-f', 'https://github.com/adiwajshing/Baileys.git', 'Baileys'],
                opt: opts
        });
        cmds.push({
                msg: "[i] Checking out submodule",
                cmd: ['git', 'checkout', BAILEYS_HASH], opt: baileysOpts
        });
}

cmds.push({
        msg: "[i] Compiling Baileys...",
        cmd: ['npm', 'install'], opt: baileysOpts
});

if (isgithttps) {
        cmds.push({
                msg: "[i] Compiling fabuya...",
                cmd: ['npx', 'swc', 'src', '-d', 'dist'], opt: opts
        });
}

for (const cmd of cmds) {
        console.log(cmd.msg);
        let { status } = spawnSync(cmd.cmd.shift(), cmd.cmd, cmd.opt);
        if (status != 0) throw "Error on prepare";
}
