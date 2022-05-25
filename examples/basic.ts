import * as fabuya from '../dist'

let config = {};
fabuya.create('WAClientName', config).then((client) => {
	client.onQRUpdated((qr) => {
		// This prints out the QR code as ASCII art
		console.log(qr);
	});

	client.onLoggedIn(() => {
		// Indicating that the app is ready
		console.log("[i]", "Yay, we are logged in as", "WAClientName");
	});
});

// Prevent Node.js from closing
// NOTE: This is not an event loop, you can for sure omit this.
fabuya.forever();
