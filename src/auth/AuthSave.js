const Baileys = require('../baileys-lib');
const fs = require('fs');


// Basically just a translation between interfaces
const KEY_MAP = {
	'pre-key': 'preKeys',
	'session': 'sessions',
	'sender-key': 'senderKeys',
	'app-state-sync-key': 'appStateSyncKeys',
	'app-state-sync-version': 'appStateVersions',
	'sender-key-memory': 'senderKeyMemory'
};

/*TODO
 * A function to get key from AuthSave.state.keys
 *
 * @param type {string} the type of the key in dash-case (pre-keys, sender-keys, etc.)
 * @param ids {Array} array of real number
 */
function keysGet(type, ids) {
	// Convert key from argument to key from SignalDataTypeMap
	const key = KEY_MAP[type];

	// Let initialValue of preKeys to be empty dictionary
	let initialValue = {};

	let retval = ids.reduce(
		// Take `initialValue`, let `intialValue` = `dict`
		(dict, id) => {
			// Remember, `this` refers to AuthSave
			// TODO: Do pre-check if this[keys] == undefined
			if (!this.keys[key]) return dict;

			let value = this.keys[key][id];

			if (value) {
				// Currently, this is what we need to pre-process
				if (type === 'app-state-sync-key') {
					// Convert `value` to protobuf format
					value = proto.AppStateSyncKey.fromObject(value);
				}

				// Store this protobuf to `dict`.
				// `id` is a number, dictionary could store number as key
				dict[id] = value;
			}

			// Replace initialValue with dict
			return dict;
		}, initialValue
	);

	return retval;
}

function keysSet(data) {
	// TODO: Avoid appending preKeys
	for (const _key in data) {
		// Translate key between interface
		const key = KEY_MAP[_key];
		// Create property as dictionary if not exists
		this.keys[key] = this.keys[key] || {};
		// Copy object A to B (create shallow copy)
		Object.assign(this.keys[key], data[_key]);
		// Don't do this
		// keys[key] = data[_key];
		// because whenever data[_key] is changed, keys[key] will follow
	}

	// Save AuthSave
	this.save();
}

class AuthSave {
	constructor(filename) {
		// TODO: Be effective in creds so preKeys changes, not appended
		this.creds = Baileys.initAuthCreds();
		this.keys = {};
		this.filename = filename;
	}

	/**
	 * Getter for .state property
	 * This property plays key role on loading an existing session
	 */
	get state() {
		return {
			creds: this.creds,
			keys: {
				// Search what Function.bind is
				get: keysGet.bind(this),
				set: keysSet.bind(this)
			}
		};
	}

	save() {
		if (!this.filename) {
			throw "Please specify AuthSave filename (try \"myClient.save\")";
		}

		fs.writeFileSync(
			this.filename,
			// "BufferJSON replacer utility saves buffers nicely"
			JSON.stringify(
				{ creds: this.creds, keys: this.keys },
				Baileys.BufferJSON.replacer
			)
		);
	}

	/**
	 * Load AuthSave from single json file
	 */
	static fromFile(filename) {
		let data = JSON.parse(
			fs.readFileSync(filename, { encoding: 'utf-8' }),
			Baileys.BufferJSON.reviver
		);
		let as = new AuthSave();

		as.creds = data.creds;
		as.keys = data.keys;
		as.filename = filename;

		return as;
	}
}

module.exports = AuthSave;
