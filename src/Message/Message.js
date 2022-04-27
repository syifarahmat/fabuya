const MessageType = {
	BASIC: 0,
	TEXT: 1
};

class Message {
	constructor(raw) {
		this.raw = raw;
		this.id = raw.key.id;
		this.isMe = raw.key.fromMe;

		this.from = raw.key.remoteJid;
		this.sender = raw.key.participant || raw.key.remoteJid;
		this.senderName = raw.pushName;

		// TODO: this.chat
		// TODO: this.from: User = null;
		this.me = null;
		this.chat = null;

		this.timestamp = raw.messageTimestamp;
	}

	static fromJSON(s) {
		let data = s;
		if (typeof(data) === 'string') {
			data = JSON.parse(s);
		}

		return new Message(data);
	}
	// TODO: implement fromJSON to TextMessage and Chat.getLatestMessage
}

module.exports = Message;
