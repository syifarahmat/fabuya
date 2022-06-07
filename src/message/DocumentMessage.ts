import type { WAMessage, WAMessageContent } from '../../Baileys'
import { proto } from '../../Baileys'

import { TextMessage } from './TextMessage'

export class DocumentMessage extends TextMessage {
	constructor(src: WAMessage) {
		super(src);
	}
	// TODO
}
