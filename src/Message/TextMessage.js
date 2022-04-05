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

	// TODO: quote method
}

module.exports = TextMessage;
