# fabuya
An open-source Baileys WhatsApp API library wrapper. No puppeteer or selenium, faster than ever!

Fabuya wraps Baileys' user-bearable library into user-enjoyable library.

Simply put a client up and assign event handlers, that's it!

## Power Up New Client
```js
const fabuya = require('fabuya');

let config = {};
fabuya.create('clientName', config).then((client) => {
	client.onQRScanned(() => {
		console.log("[*] QR Code scanned, logging in...");
	});

	client.onMessage((msg) => {
		console.log("[i] New message: ", msg.content);
		msg.reply("Hello!");
	});
});

// Keep the program going
// omit this if you have other implementation
fabuya.forever();
```
