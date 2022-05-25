import type { WAMessage, WAMessageContent } from '../Baileys'

import { Message } from './Message'
import type { MessageT } from './Message'

export class TextMessage extends Message {
	content: string = '';
	quoted?: WAMessageContent;
	mentions?: string[];
	isForwarded: boolean = false;
	forwardCount?: number;

	reply: (response: string) => Promise<void>;
	quote: (response: string) => Promise<void>;
	read: (response: string) => Promise<void>;
	delete: (forEveryone: boolean) => Promise<void>;

	constructor(src: WAMessage) {
		super(src);

		let inner: WAMessageContent = src.message;
		this.content = inner.conversation;

		if (inner.extendedTextMessage) {
			let extended = inner.extendedTextMessage;
			this.content = extended.text;

			if (extended.contextInfo) {
				let ctx = extended.contextInfo;

				this.quoted = ctx.quotedMessage;
				this.mentions = ctx.mentionedJid;
				this.isForwarded = ctx.isForwarded;
				this.forwardCount = ctx.forwardingScore;
			}
		}
	}
};

// TODO: response can be media or something
TextMessage.prototype.reply = async function reply(response: string): Promise<void> {
	await this.me.sock.sendMessage(this.from, { text: response });
};

TextMessage.prototype.quote = async function quote(response: string): Promise<void> {
	await this.me.sock.sendMessage(this.from, { text: response }, { quoted: this.raw });
};

TextMessage.prototype.read = async function read(response: string): Promise<void> {
	await this.me.readMessages([this.raw.key]);
};

TextMessage.prototype.delete = async function _delete(forEveryone: boolean = true): Promise<void> {
	if (forEveryone) {
		await this.me.sock.sendMessage(this.from, { delete: this.raw.key });
	} else {
		// TODO: implement deleting message for self
		throw new Error("Deleting message for yourself is not yet implemented.");
	}
};
