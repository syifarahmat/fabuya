import { Message } from './Message'
import { TextMessage } from './TextMessage'
//import { ImageMessage } from './ImageMessage'
import { DocumentMessage } from './DocumentMessage'

export interface GenericMessage extends Partial<Message>,
					Partial<TextMessage>,
//					Partial<ImageMessage>,
					Partial<DocumentMessage>
					{};
