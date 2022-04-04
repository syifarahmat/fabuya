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

	client.onLogs((data) => {
		// Drop all debug logs
		if (data.level < 40) return;

		// Log all important data
		console.dir(data);
	});
});
