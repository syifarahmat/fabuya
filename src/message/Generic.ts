import { Message } from './Message'
import { TextMessage } from './TextMessage'

export type GenericMessage = Partial<Message> & Partial<TextMessage>;
