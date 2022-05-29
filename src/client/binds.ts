import { Boom } from '@hapi/boom'
import { DisconnectReason, WAMessage } from '../../Baileys'
import { proto } from '../../Baileys'
import { isJidUser, isJidBroadcast, isJidGroup, isJidStatusBroadcast, jidNormalizedUser } from '../../Baileys'
import type { WAMessageContent } from '../../Baileys'

import { MessageDirection } from './enums'

import { GenericMessage, Message, TextMessage } from '../message'
import type { MessageT } from '../message'
import { Chat, Group } from '../chat'
import type { ChatT } from '../chat'

import * as utils from '../utils'

export function bindInternalConnectionEvents(): void {
	this.on('connection.update', (update) => {
		const { connection, isNewLogin, lastDisconnect } = update;

		if (connection === "open") {
			this.ev.emit('loggedin');
		} else if (connection === "connecting") {
			this.ev.emit('connecting');
		} else if (connection === "close") {
			let code = (lastDisconnect.error as Boom)?.output?.statusCode;

			switch (code) {
				case 515: // AKA Stream error
				case DisconnectReason.restartRequired:
					this.reconnect();
					break;
				case DisconnectReason.loggedOut:
					this.ev.emit('loggedout');
					break;
			}
		}
	});
};

export async function generateMessageObject(src: WAMessage): Promise<GenericMessage> {
	let m: GenericMessage = new Message(src);
	let inner: WAMessageContent = src.message;

	if (inner) {
		if (inner.conversation || inner.extendedTextMessage) {
			m = new TextMessage(src);
		}
	}

	// Initialize reference variables
	m.me = this;
	m.from = jidNormalizedUser(m.from ?? this.sock.user.id);

	// Initialize Chat reference
	let chat: ChatT;
	if (isJidUser(m.from)) {
		chat = new Chat;
		chat.name = m.senderName;
	} else if (isJidGroup(m.from)) {
		// Requires fetching
		chat = await Group.fromJid(this.sock, m.from);
	}

	if (chat) {
		chat.id = m.from;
		chat.me = this;
		m.chat = chat;
	}

	return m;
};

export function bindMessageTraffic(cb: ((msg: GenericMessage) => void), mode: MessageDirection): void {
	this.on('messages.upsert', async (data) => {
		let { messages, type } = data;

		if (type !== "notify") return;

		for (const msg of messages) {
			// Check message packet source
			if (mode === MessageDirection.INCOMING && msg.key.fromMe === true) continue;
			if (mode === MessageDirection.OUTCOMING && msg.key.fromMe === false) continue;

			// Prepare retval
			let m: GenericMessage = await generateMessageObject.call(this, msg);

			// Send data to callback
			cb(m);
		}
	});
};

export async function getSentMessageByKey(key: proto.IMessageKey): Promise<proto.IMessage | undefined> {
	for (const msg of this.sentMessages) {
		// Why did key.id has participant additional key duh
		if (msg.key.id === key.id) {
			return msg.message;
		}
	}

	return undefined;
};
