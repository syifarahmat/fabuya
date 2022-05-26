import { BinaryNode, WAPatchCreate } from '../../Baileys'
import { proto } from '../../Baileys'
import { jidDecode } from '../../Baileys'

// TODO: to delete, use `null` as the newPicture
export async function changeProfilePicture(newPicture: Uint8Array | Buffer): Promise<void> {
	await this.sock.updateProfilePicture(this.sock.user.id, newPicture);
};

export async function fetchProfilePictureUrl(): Promise<string> {
	return await this.sock.profilePictureUrl(this.sock.user.id);
};

export async function changePushName(newName: string, makeOnline: boolean = true): Promise<BinaryNode> {
	let node: BinaryNode = {
		tag: "presence",
		attrs: {
			name: newName,
			type: makeOnline ? 'available' : 'unavailable'
		}
	};

	// No answer
	this.query(node).then(() => {}).catch(() => {});

	// Start appPatch
	let patch: WAPatchCreate = {
		syncAction: {
			pushNameSetting: {
				name: newName
			},
			timestamp: Date.now()
		},
		index: ['setting_pushName'],
		type: 'critical_block',
		apiVersion: 1,
		operation: proto.SyncdMutation.SyncdMutationSyncdOperation.SET,
	};
	let response: BinaryNode = await this.sock.appPatch(patch);
	return response;
};

export async function changeStatus(newStatus: string): Promise<void> {
	let node: BinaryNode = {
		tag: "iq",
		attrs: {
			to: "s.whatsapp.net",
			type: "set",
			xmlns: "status"
		},
		content: [{
			tag: "status",
			attrs: {},
			content: Buffer.from(newStatus, 'utf-8')
		}]
	};

	await this.query(node);
};
