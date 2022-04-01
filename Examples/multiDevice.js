const fabuya = require('../index');

fabuya.create('Hanz', {
	printQRInTerminal: false
}).then(client => {
	client.onQRUpdated((ascii) => {
		console.log(ascii);
	});

	client.onQRScanned(() => {
		console.log("[*] QR Code Scanned, logging in...");
	});

	client.onMessage(async (msg) => {
		console.dir(msg);

		if (msg.content.toLowerCase().includes('assalam')) {
			await msg.reply("Wa'alaikumsalam");
		}
	});

	client.onLogs((data) => {
		// Drop all debug logs
		if (data.level < 40) return;

		// Log all important data
		console.log(data.msg);
	});
});

fabuya.forever();
