const fabuya = require('../index');

fabuya.create('ClientName', {
	printQRInTerminal: true
}).then(client => {
	client.onMessage((msg) => {
		console.log(msg);
	});

	client.onLoggedIn(() => {
		console.log("[i] Logged in");
	});

	/* When client logged out, from device or from fabuya */
	client.onLoggedOut(() => {
		console.log("[i] Logged out");
		process.exit(0);
	});

	client.onLogs((data) => {
		// Drop all debug logs
		if (data.level < 40) return;

		// Log all important data
		console.dir(data);
	});
});
