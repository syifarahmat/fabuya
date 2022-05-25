import type { GroupMetadata } from '../../Baileys'

import { Chat } from './Chat'
import type { ChatT } from './Chat'

export class Group extends Chat {
	creator: string;
	createdAt: string | number;
	// TODO: desc
	// TODO: isOnlyAdmins
	// TODO: isSettingsOpen
	// TODO: members getter

	constructor() {
		super();
		this.isGroup = true;
	}

	static async fromJid(sock, jid) {
		let data: GroupMetadata = await sock.groupMetadata(jid);
		let g = new Group();

		g.id = data.id;
		g.name = data.subject;
		g.creator = data.owner;
		g.createdAt = data.creation;

		return g;
	}
};

export type GroupT = InstanceType<typeof Group>;
