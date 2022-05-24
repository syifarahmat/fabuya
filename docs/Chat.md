### fabuya.Chat
Reference to a chat session.

#### Properties
Name | Type | Default | Summary
---- | ---- | ------- | -------
id | String | '' | The Jid of the chat session
name | String | '' | The name of the chat session

#### Methods
 - ##### async send(msg: String)
   Sends regular message to the chat. If the chat is regular (personal chat,
   it will wrap the `fabuya.send` method. If it is group chat, it will be calling
   `.me.sendMessage` internally. You don't need to worry about it.
