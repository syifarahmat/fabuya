import fs from 'fs'
import path from 'path'

import { jidNormalizedUser } from '../../Baileys'
import type { WAMessage, Chat, Contact } from '../../Baileys'

import type { ClientT } from '../client'

let subDirs = {
	contact: 'contact/',
	chat: 'chat/',
	message: 'message/'
};

export type ContactSyncData = { contacts: Contact[] };
export type ChatSyncData = { chats: Chat[], isLatest: boolean };
export type MessageSyncData = { messages: WAMessage[], isLatest: boolean };

export function flattenJid(jid: string) {
	// Just make them fs compliant
	return jid.replace('@', '-');
};

export class StructuredStorage {
	saveDir: string;

	// TODO: 'update' event

	constructor(saveDir: string) {
		this.saveDir = saveDir;

		fs.mkdirSync(saveDir, { recursive: true });

		saveDir += path.sep;
		for (const dir of Object.values(subDirs)) {
			fs.mkdirSync(path.join(saveDir, dir), { recursive: true });
		}
	}

	bind(client: ClientT): void {
		client.store = this;
		client.on('contacts.set', contactSync.bind(this));
//		client.on('chats.set', chatSync.bind(this));
//		client.on('messages.set', messageSync.bind(this));
	}

	searchContactByJid(jid: string): Contact | undefined {
		jid = jidNormalizedUser(jid);
		let file = path.join(this.saveDir, subDirs.contact, flattenJid(jid));
		if (!fs.existsSync(file)) return undefined;

		let raw = fs.readFileSync(file).toString();
		let data = JSON.parse(raw);

		return data;
	}
};

function contactSync({ contacts }: ContactSyncData) {
	for (const contact of contacts) {
		let jid = jidNormalizedUser(contact.id);
		let fname: string = flattenJid(jid);
		// XXX: Consider using async function
		// TODO: Store contact as binary structure
		fname = path.join(this.saveDir, subDirs.contact, fname);
		fs.writeFileSync(fname, JSON.stringify(contact));
	}
}

function chatSync({ chats, isLatest }: ChatSyncData) {
	for (const chat of chats) {
		console.dir(chat);
	}
}

function messageSync({ messages, isLatest }: MessageSyncData) {
	for (const message of messages) {
		console.dir(message);
	}
}
