import type { ClientT } from '../client'

export interface ChatJson {
	id: string;
	name: string;
	isGroup: boolean;
};

export class Chat {
	me: ClientT | undefined;
	store: undefined; // TODO: implement store
	id: string;
	name: string;
	isGroup: boolean;

	send: (msg: string) => Promise<void>;
	toJSON: () => ChatJson;

	constructor() {
		this.me = undefined;
		this.id = '';
		this.name = '';
		this.isGroup = false;
	}
};

Chat.prototype.send = async function send(msg: string): Promise<void> {
	if (this.me === undefined) throw new Error("bind error on chat requires client.");
	await this.me.send(this.id, msg);
};

Chat.prototype.toJSON = function toJSON(): ChatJson {
	return {
		id: this.id,
		name: this.name,
		isGroup: this.isGroup
	};
};

export type ChatT = InstanceType<typeof Chat>;
