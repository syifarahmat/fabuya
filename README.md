# fabuya
[![Edge version](https://github.com/HanzHaxors/fabuya/actions/workflows/check-commit.yml/badge.svg)](https://github.com/HanzHaxors/fabuya/actions/workflows/check-commit.yml)

An open-source [Baileys](https://github.com/adiwajshing/Baileys) WhatsApp API library wrapper. No puppeteer or selenium, faster than ever!<br/>
Fabuya wraps Baileys' user-bearable library into user-enjoyable library.<br/>
Simply put a client up and assign event handlers, that's it!

# WARNING: fabuya IS NOT PRODUCTION READY, UNSTABLE, AND IN UNDER ACTIVE DEVELOPMENT.

## Installation
From NPM
```sh
npm install --save fabuya@beta
```
More version on the documentation below

# Documentation
https://github.com/HanzHaxors/fabuya/tree/main/docs

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
		//msg.reply("Hello!");
	});
});

// Keep the program going
// omit this if you have other implementation
fabuya.forever();
```

## Found an Issue?
Or simply want to add a new feature you have been dreaming of?<br>
Submit a new Issue with the correct formation and relax.

## For Developers
Want to contribute to the project? Easy,
1. Find an issue to start with
2. Fork the project
3. Make PR
4. Get merged.
