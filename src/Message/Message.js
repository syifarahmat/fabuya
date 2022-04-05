function getSender(raw) {
	return raw.key.participant || raw.key.remoteJid;
}

class Message {
	constructor(raw) {
		this.raw = raw;
		this.id = raw.key.id;
		this.isMe = raw.key.fromMe;
		this.from = getSender(raw);
		this.me = null;

		this.timestamp = raw.messageTimestamp;
		this.sender = this.pusher = raw.pushName;
	}
}

module.exports = Message;
