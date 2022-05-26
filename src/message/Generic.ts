import { Message } from './Message'
import { TextMessage } from './TextMessage'

export interface GenericMessage extends Partial<Message>, Partial<TextMessage> {};
