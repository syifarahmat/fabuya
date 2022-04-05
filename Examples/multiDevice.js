const fabuya = require('../index');
const fabuyaStorage = fabuya.storage;

const store = new fabuyaStorage.memory();

fabuya.create('ClientName', {
	printQRInTerminal: false
}).then(client => {
	client.onQRUpdated((ascii) => {
		console.log(ascii);
	});

	client.onQRScanned(() => {
		console.log("[*] QR Code Scanned, logging in...");
	});

	client.onLoggedIn(() => {
		console.log("[i] Logged in");
	});

	client.onMessage((msg) => {
		console.log("[i] New message from", msg.sender, ":", msg.content);
	});

	client.onLogs((data) => {
		// Drop all debug logs
		if (data.level < 40) return;

		// Log all important data
		console.log(data.msg);
	});

	store.bindClient(client);
	setInterval(() => store.save(), 10_000);
});

fabuya.forever();
