import { BinaryNode } from '../../Baileys'

// to delete, use `null` as the newPicture
export async function changeProfilePicture(newPicture: Buffer | null): Promise<BinaryNode> {
	let node: BinaryNode = {
		tag: "iq",
		attrs: {
			to: "s.whatsapp.net",
			type: "set",
			xmlns: "w:profile:picture"
		},
		content: [{
			tag: "picture",
			attrs: { type: "image" },
			content: newPicture
		}]
	};

	if (newPicture === null) {
		node.content = null;
	}

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

	let response: BinaryNode = await this.query(node);
	return response;
};
