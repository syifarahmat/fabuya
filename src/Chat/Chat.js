class Chat {
	constructor() {
		this.me = undefined;
		this.id = '';
		this.name = '';
	}

	async send(msg) {
		await this.me.send(this.id, msg);
	}

	// TODO: Get Last Message
}

module.exports = Chat;
