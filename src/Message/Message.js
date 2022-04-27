class Message {
	constructor(raw) {
		this.raw = raw;
		this.id = raw.key.id;
		this.isMe = raw.key.fromMe;
		this.from = raw.key.remoteJid;
		// TODO: this.chat
		// TODO: this.from: User = null;
		this.me = null;
		this.chat = null;

		this.timestamp = raw.messageTimestamp;
		this.sender = this.pusher = raw.pushName;
	}
}

module.exports = Message;
