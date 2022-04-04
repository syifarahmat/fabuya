# fabuya
An open-source Baileys WhatsApp API library wrapper. No puppeteer or selenium, faster than ever!

Fabuya wraps Baileys' user-bearable library into user-enjoyable library.

Simply put a client up and assign event handlers, that's it!

## Installation
From NPM
```sh
npm install --save fabuya
```

## Power Up New Client
```js
const fabuya = require('fabuya');

let config = {};
fabuya.create('clientName', config).then((client) => {
	// When QR changed or created
	// display them on console
	client.onQRUpdated((qr) => {
		console.log(qr);
	});
	
	// This is when the QR has been scanned
	client.onQRScanned(() => {
		console.log("[*] QR Code scanned, logging in...");
	});

	// This is fired when new incoming/outgoing
	// messages sent. Currently, the library also
	// includes system messages
	client.onMessage((msg) => {
		console.log("[i] New message: ", msg.content);
		msg.reply("Hello!");
	});
});

// Keep the program going
// omit this if you have other implementation
fabuya.forever();
```
