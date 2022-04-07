### fabuya.Client
It is recommended not to initiate this class using the `new` keyword.
Please use [`fabuya.create`](#create) instead.

 - #### reconnect()
   Initiate client reconnection
 - #### async send(to: String, message: String)
   **to** - Recipient phone number (e.g. +1 234 567 890)
   **message** - Text to send

   This function sends basic text message to the recipient.
   `to` Parameter will be normalized to Jid by `fabuya`.

   **Example**
   ```js
   await client.send("+1 (234) 567 890", "hello");
   ```
 - #### onQRUpdated(callback: Function(qr: String, data: String))
   **callback**
    - **qr** - The QR code ASCII art
    - **data** - Raw data to be encoded as QR

    This function serves as a middleware assigner
    to an event which fires upon generating or receiving
    updates about the registration QR code.

    **Example**
    ```js
    client.onQRUpdated(function (qr, data) {
    	console.log(qr);
    	console.dir(data);
    });
    ```
 - #### onQRScanned(callback: Function)
   **callback** - Called when QR code has been scanned
 - #### onLoggedIn(callback: Function)
   **callback** - Called when Baileys core library successfully log your account
 - #### onMessage(callback: Function(msg: Message|[TextMessage]))
   **callback**
    - **msg** - A [Message](#Message) object or [TextMessage](#TextMessage) object when applicable

   Fired when a Message protobuf packet arrives while client is alive.
 - #### onIncomingMessage(callback: Function(msg: Message|[TextMessage]))
   **callback**
    - **msg** - A [TextMessage](#TextMessage) object when applicable

   Fired when a Message protobuf packet arrives to our client while client is alive.
   Also, when client received message from any connection (remote/host).
 - #### onOutcomingMessage(callback: Function(msg: Message|[TextMessage]))
   **callback**
    - **msg** - A [Message](#Message) object or [TextMessage](#TextMessage) object when applicable

   Fired when a Message protobuf packet arrives from our client while client is alive.
   Also, when client sent message from any connection (remote/host).
 - #### onReconnect(callback: Function)
   **callback** - Called when [Client.reconnect()](#reconnect) called.
 - #### onLogs(callback: Function)
   **callback** - Called when pino logger pushes message.

### fabuya.create
```
async fabuya.create(clientName: String, configuration: Object) -> Promise<fabuya.Client>
```
**clientName** - Used for internal processing and session management, useful for middlewares
**configuration** - An extended configuration brought from Baileys' (WIP: implement a class for this)


Creates a new client.

