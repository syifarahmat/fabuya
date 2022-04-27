class Chat {
	constructor() {
		this.me = undefined;
		this.store = undefined;
		this.id = '';
		this.name = '';
		this.isGroup = false;

		this.properties = ['id', 'name', 'isGroup'];
	}

	async send(msg) {
		await this.me.send(this.id, msg);
	}

	// TODO: Get Last Message
	get lastMessage() {
		if (this.store === undefined) {
			// We require message store to retrieve this
			return null;
		}

		let msgs = this.store.getChatLatestMessages(this.id, 10);
		return msgs[msgs.length-1];
	}

	toJSON() {
		let dict = {};
		for (const prop of this.properties) {
			dict[prop] = this[prop];
		}
		return dict;
	}
}

module.exports = Chat;
