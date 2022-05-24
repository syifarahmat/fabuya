const fabuya = require('../index');
const fabuyaStorage = fabuya.storage;

const saveDir = "ClientNameSaveDir";
const store = new fabuyaStorage.structured(saveDir);

fabuya.create('ClientName', {
	printQRInTerminal: false
}).then(client => {
	client.onQRUpdated((ascii) => {
		console.log(ascii);
	});

	client.onLoggedIn(async () => {
		console.log("[i] Logged in");
//		console.log("[*] Resyncing");
//		await store.resync(); // TODO: Add manual resync method
//		console.log("[i] Resynced");
	});

	client.onLogs((data) => {
		// Drop all debug logs
		if (data.level < 0) return;

		// Log all important data
		console.log(data);
	});

	store.bindClient(client);
});

fabuya.forever();
