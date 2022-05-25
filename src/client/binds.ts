import { Boom } from '@hapi/boom'
import { DisconnectReason } from '../../Baileys'
import { isJidUser, isJidBroadcast, isJidGroup, isJidStatusBroadcast, jidNormalizedUser } from '../../Baileys'

import { MessageDirection } from './enums'

import { Message, TextMessage } from '../message'
import type { MessageT } from '../message'
import { Chat, Group } from '../chat'
import type { ChatT } from '../chat'

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

export function bindMessageTraffic(cb: ((msg: Message) => void), mode: MessageDirection): void {
	this.on('message.upsert', async (data) => {
		let { messages, type } = data;

		if (type !== "notify") return;

		for (const msg of messages) {
			// Check message packet source
			if (mode === MessageDirection.INCOMING && msg.key.fromMe === true) continue;
			if (mode === MessageDirection.OUTCOMING && msg.key.fromMe === false) continue;

			// Prepare retval
			let m: MessageT = new Message(msg);
			/*let inner = msg.message;

			if (inner) {
				// Basic text message
				if (inner.conversation || inner.extendedTextMessage) {
					m = 
				}
			} SHOULD IMPLEMENT TO Message.fromTruth*/

			// Initialize reference variables
			m.me = this;
			m.from = jidNormalizedUser(m.from ?? this.sock.user.id);

			// Initialize Chat reference
			let chat: ChatT;
			if (isJidUser(m.from)) {
				chat = new Chat;
				// TODO: Get chat name from contact
				chat.name = m.senderName;
			} else if (isJidGroup(m.from)) {
				// Requires fetching
				chat = await Group.fromJid(this.sock, m.from);
			}

			chat.id = m.from;
			chat.me = this;
			m.chat = chat;

			// Send data to callback
			cb(m);
		}
	});
};
