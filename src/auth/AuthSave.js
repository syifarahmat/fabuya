const Baileys = require('../../baileys-lib');
const fs = require('fs');

const BaseAuthSave = require('./BaseAuthSave');

class AuthSave extends BaseAuthSave {
	constructor(filename) {
		super(filename);
	}

	/**
	 * Save information to a file
	 */
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
}

module.exports = AuthSave;
