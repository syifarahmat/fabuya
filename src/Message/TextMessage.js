const Message = require('./Message');

class TextMessage extends Message {
	constructor(raw) {
		super(raw);

		let inner = raw.message;
		this.content = this.text = inner.conversation;

		// Possible qoute message and mentions
		if (inner.extendedTextMessage) {
			let extended = inner.extendedTextMessage;

			this.content = this.text = extended.text;

			// ContextInfo
			if (extended.contextInfo) {
				let ctx = extended.contextInfo;

				// quoted message
				this.quoted = ctx.quotedMessage;

				// Mentions
				this.mentions = ctx.mentionedJid;

				// Forwards
				this.isForwarded = ctx.isForwarded;
				this.forwardCount = ctx.forwardingScore;
			}
		}
	}

	async reply(response) {
		await this.me.sock.sendMessage(this.from, { text: response });
	}

	async quote(response) {
		await this.me.sock.sendMessage(this.from, { text: response }, { quoted: this.raw });
	}

	async read() {
		await this.me.readMessages([this.raw.key]);
	}

	async delete(forEveryone=true) {
		if (forEveryone) {
			await this.me.sock.sendMessage(this.from, { delete: this.raw.key });
		} else {
			throw "Deleting message for yourself is not yet implemented.";
			/*await this.me.sock.chatModify({
				clear: {
					message: {
						id: this.id,
						fromMe: this.isMe
					}
				},
				this.chat.id,
				[]
			});*/ // TODO: Delete message for myself
		}
	}
}

module.exports = TextMessage;
