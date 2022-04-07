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

	static fromFile(filename) {
		let base = BaseAuthSave.fromFile(filename);
		let auth = new AuthSave(filename);

		auth.creds = base.creds;
		auth.keys = base.keys;

		return auth;
	}
}

module.exports = AuthSave;
