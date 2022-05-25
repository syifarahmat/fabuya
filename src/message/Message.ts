import type { WAMessage, WAMessageKey } from '../Baileys'
import { jidNormalizedUser } from '../Baileys'

import type { ClientT } from '../client'
import type { ChatT } from '../chat'

export class Message {
	raw: WAMessage | undefined;
	id: string;
	isMe: boolean;
	from: string;
	sender: string;
	senderName: string;
	me: ClientT | undefined;
	chat: ChatT | undefined;
	timestamp: number | Long;

	isValid: () => boolean;

	constructor(src: WAMessage) {
		let key: WAMessageKey = src.key;

		this.raw = src;
		this.id = key.id;
		this.isMe = key.fromMe;
		this.from = jidNormalizedUser(key.remoteJid);
		this.sender = jidNormalizedUser(key.participant ?? key.remoteJid);
		this.senderName = src.pushName;

		this.me = undefined;
		this.chat = undefined;

		this.timestamp = src.messageTimestamp ?? -1;
	}
};

Message.prototype.isValid = function isValid(): boolean {
	if (isNaN(this.timestamp)) return false;

	if (this.me === undefined) return false;
	// TODO: Any type of message MUST change this property to either Variable or Null
	if (this.chat === undefined) return false;

	return true;
};

export type MessageT = InstanceType<typeof Message>;
