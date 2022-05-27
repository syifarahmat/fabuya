import type { WAMessage, WAMessageKey } from '../../Baileys'
import { jidNormalizedUser, isJidGroup, isJidUser } from '../../Baileys'
import { proto, BinaryNode } from '../../Baileys'

import type { ClientT } from '../client'
import type { ChatT } from '../chat'

import { Chat, Group } from '../chat'

export interface MessageReceipt {
	delivered: boolean;
	pending: boolean;
	playedAt: number | Long;
	readAt: number | Long;
	timestamp: number | Long;
	jid: string;
};

export interface MessageReader {
	reader: ChatT,
	chat: ChatT,
	timestamp: number | Long
};

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
	readonly receipt: Array<MessageReceipt | proto.IUserReceipt>;

	isValid: () => boolean;
	onRead: (cb: (reader: MessageReader) => void) => void;

	constructor(src: WAMessage) {
		let key: WAMessageKey = src.key;

		this.raw = src;
		this.id = key.id;
		this.isMe = key.fromMe;
		this.from = jidNormalizedUser(key.remoteJid);
		this.sender = jidNormalizedUser(key.participant || key.remoteJid);
		this.senderName = src.pushName;

		this.me = undefined;
		this.chat = undefined;

		this.timestamp = src.messageTimestamp ?? -1;

		// TODO: Parse this to MessagReceipt
		// TODO: Buy new keyboard
		this.receipt = src.userReceipt;
	}
};

Message.prototype.isValid = function isValid(): boolean {
	if (isNaN(this.timestamp)) return false;

	if (this.me === undefined) return false;
	// TODO: Any type of message MUST change this property to either Variable or Null
	if (this.chat === undefined) return false;

	return true;
};

Message.prototype.onRead = function onRead(cb: (reader: MessageReader) => void): void {
	if (this.me === undefined) {
		throw new Error("Message class not initialized completely. Please report bug.");
	}

	// TODO: Make a framework for middlewares to work around this CB thing. It only supports limited params duh
	this.me.sock.ws.on(`TAG:${this.id}`, async (node: BinaryNode) => {
		if (((node.attrs.class || node.tag) !== "receipt") || node.attrs.type !== "read") return;

		let readerJid: string = jidNormalizedUser(node.attrs.participant || node.attrs.from);
		let chatJid: string = jidNormalizedUser(node.attrs.to || node.attrs.from);

		let reader: ChatT = new Chat;
		// TODO: Get reader name from Jid
		reader.name = '';
		reader.id = readerJid;
		reader.me = this.me;

		let chat: ChatT;
		if (isJidUser(chatJid)) {
			chat = reader;
		} else if (isJidGroup(chatJid)) {
			chat = await Group.fromJid(this.me.sock, chatJid);
			chat.me = this.me;
		}

		let detail: MessageReader = {
			reader, chat,
			timestamp: Date.now()
		};

		cb(detail);
	});
};

export type MessageT = InstanceType<typeof Message>;
