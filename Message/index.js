
class Message {
	constructor() {
		// pass
	}

	/**
	 * Load data from Baileys' msg object
	 */
	static from(msg) {
		let cmsg = new Message();

		// Fill in properties
		cmsg.raw = msg;
		cmsg.id = msg.key.id;
		cmsg.from = msg.key.remoteJid;
		cmsg.isMe = msg.key.fromMe;
		cmsg.me = null; // Should be filled with `client`

		cmsg.timestamp = msg.messageTimestamp;
		cmsg.pusher = msg.pushName;

		let inner = msg.message;
		cmsg.content = inner.conversation || "";

		// Aliases
		cmsg.text = cmsg.content;
		cmsg.sender = cmsg.pusher;

		return cmsg;
	}

	async reply(response) {
		await this.me.sock.sendMessage(this.from, { text: response });
	}
}

module.exports = Message;
