import { Message } from './Message'
import { TextMessage } from './TextMessage'

export interface GenericMessage extends Message, TextMessage;
