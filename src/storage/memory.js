let Baileys = require('../../baileys-lib');

class memory {
	constructor() {
		this.clientName = "";
		this.store = Baileys.makeInMemoryStore({});
	}

	/**
	 * Getters
	 */
	get chats() { return this.store.chats; }
	get contacts() { return this.store.contacts; }
	get messages() { return this.store.messages; }
	get groupMetadata() { return this.store.groupMetadata; }
	get state() { return this.store.state; }
	get presences() { return this.store.presences; }

	/**
	 * loadMessages
	 */
	get loadMessages() { return this.store.loadMessages; }

	get loadMessage() { return this.store.loadMessage; }

	get mostRecentMessage() { return this.store.mostRecentMessage; }

	get fetchImageUrl() { return this.store.fetchImageUrl; }

	get fetchGroupMetadata() { return this.store.fetchGroupMetadata; }

	get fetchBroadcastListInfo() { return this.store.fetchBroadcastListInfo; }

	get fetchMessageReceipts() { return this.store.fetchMessageReceipts; }

	get toJSON() { return this.store.toJSON; }

	get fromJSON() { return this.store.fromJSON; }

	/**
	 *
	 */
	bindClient(client) {
		// TODO: saves `client` to a variable
		this.clientName = client.clientName;
		this.store.bind(client.sock.ev);
	}

	save(filename) {
		try {
			this.store.writeToFile(`./${this.clientName}-memory-store.json`);
		} catch (e) {
			// TODO: alert to client
			console.log(e);
		}
	}

	load(filename=undefined) {
		if (filename) {
			// If `filename` not undefined, pass it to function
			this.store.readFromFile(filename);
		} else if (this.clientName) {
			// If `filename` undefined but client already has been binded,
			// pass the default filename using clientName
			this.store.readFromFile(`./${this.clientName}-memory-store.json`);
		} else {
			// Otherwise, throw
			throw 'Please bind a client first';
		}
	}
}

module.exports = memory;
