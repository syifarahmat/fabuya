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

		// Contact mutations
		client.on('contacts.set', contactSync.bind(this));
		client.on('contacts.upsert', contactUpsert.bind(this));
		client.on('contacts.update', contactUpdate.bind(this));

		// Chat mutations
		client.on('chats.set', chatSync.bind(this));
		client.on('chats.upsert', chatUpsert.bind(this));
		client.on('chats.update', chatUpdate.bind(this));
//		client.on('messages.set', messageSync.bind(this));
	}

	// TODO: Convert this to fabuya's Contact
	searchContactByJid(jid: string): Contact | undefined {
		jid = jidNormalizedUser(jid);
		let file = path.join(this.saveDir, subDirs.contact, flattenJid(jid));
		if (!fs.existsSync(file)) return undefined;

		let raw = fs.readFileSync(file).toString();
		let data = JSON.parse(raw);

		return data;
	}

	// TODO: Convert this to fabuya's Chat
	searchChatByJid(jid: string): Chat {
		jid = jidNormalizedUser(jid);
		let file = path.join(this.saveDir, subDirs.chat, flattenJid(jid));
		if (!fs.existsSync(file)) return undefined;

		let raw = fs.readFileSync(file).toString();
		let data = JSON.parse(raw);

		return data;
	}
};

// Contact history sync
function contactSync({ contacts }: ContactSyncData) {
	// TODO: Detect and remove deleted contact
	for (const contact of contacts) {
		let jid = jidNormalizedUser(contact.id);
		let fname: string = flattenJid(jid);
		// XXX: Consider using async function
		// TODO: Store contact as binary structure
		fname = path.join(this.saveDir, subDirs.contact, fname);
		fs.writeFileSync(fname, JSON.stringify(contact));
	}
}

// New contact
function contactUpsert(contacts: Contact[]) {
	contactSync.call(this, { contacts });
}

// Contact update
function contactUpdate(contacts: Partial<Contact>[]) {
	for (const contact of contacts) {
		let data: Contact = this.searchContactByJid(contact.id) ?? {};

		Object.assign(data, contact);
		contactSync.call(this, {
			contacts: [data]
		});
	}
}

// Chat history sync
function chatSync({ chats, isLatest }: ChatSyncData) {
	if (isLatest) {
		let files = fs.readdirSync(path.join(this.saveDir, subDirs.chat));
		for (const each of files) {
			fs.unlinkSync(path.join(this.saveDir, subDirs.chat, each));
		}
	}

	for (const chat of chats) {
		fs.writeFileSync(
			path.join(this.saveDir, subDirs.chat, flattenJid(jidNormalizedUser(chat.id))),
			// XXX: JSON stringify slow
			// TODO: Store this as binary
			JSON.stringify(chat)
		);
	}
}

// Chat upsert
function chatUpsert(chats: Chat[]) {
	chatSync.call(this, {
		chats,
		isLatest: false
	});
}

// Chat update
function chatUpdate(chats: Partial<Chat>[]) {
	for (const chat of chats) {
		let data: Chat = this.searchChatByJid(chat.id) ?? {};

		Object.assign(data, chat);
		contactSync.call(this, {
			contacts: [data]
		});
	}
}

function messageSync({ messages, isLatest }: MessageSyncData) {
	for (const message of messages) {
		console.log("MESSAGE");
		console.dir(message);
	}
}
