import { BinaryNode, WAPatchCreate } from '../../Baileys'
import { proto } from '../../Baileys'

// to delete, use `null` as the newPicture
export async function changeProfilePicture(newPicture: Uint8Array | Buffer | null): Promise<BinaryNode> {
	let node: BinaryNode = {
		tag: "iq",
		attrs: {
			to: "s.whatsapp.net",
			type: "set",
			xmlns: "w:profile:picture"
		}
	};

	if (newPicture === null) {
		node.content = null;
	} else {
		node.content = [{
			tag: "picture",
			attrs: { type: "image" },
			content: newPicture
		}]
	}

	let response: BinaryNode = await this.query(node);
	return response;
};

export async function fetchProfilePictureUrl(): Promise<string> {
	let node: BinaryNode = {
		tag: "iq",
		attrs: {
			to: "s.whatsapp.net",
			type: "get",
			xmlns: "w:profile:picture"
		},
		content: {
			tag: "picture",
			attrs: {
				query: "url"
			},
			content: null
		}
	};

	let response: BinaryNode = await this.query(node);
	return response;
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
