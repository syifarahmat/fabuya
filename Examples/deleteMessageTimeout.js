const fabuya = require('../index');

fabuya.create('ClientName', {
	printQRInTerminal: true
}).then(client => {
	client.onOutcomingMessage((msg) => {
		// All of your sent messages
		// will be deleted after 5 seconds
		console.log(msg);
		setTimeout(async () => {
			await msg.delete()
		}, 5000);
	});

	client.onLoggedIn(() => {
		console.log("[i] Logged in");
	});

	client.onLogs((data) => {
		// Drop all debug logs
		if (data.level < 40) return;

		// Log all important data
		console.dir(data);
	});
});
