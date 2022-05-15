const EventEmitter = require('events');
const stream = require('stream');

const Baileys = require('./baileys-lib');
const QR = require('qrcode-terminal');

const auth = require('./src/auth');
const storage = require('./src/storage');

const logger = require('./src/logger');
const utils = require('./src/utils');

// Whatsapp objects
const Messages = require('./src/Message');
const Chat = require('./src/Chat');

const makeWASocket = Baileys.default;

// TODO: create `Configuration` class
async function create(clientName, config={}) {
	// TODO: Default config filling
	config.clientName = clientName;
	// Fill with latest version if version is not defined
	if (config.version === undefined) {
		// Get latest Whatsapp version
		// TODO: Maybe try caching?
		let version = await utils.getWhatsappVersion();
		config.version = version;
	}
	// ALlow second try for keep alive request
	config.connectTimeoutMs = ((config.keepAliveIntervalMs || 15_000) * 2) + 1_000;

	// Make new Whatsapp socket
	let client = new Client(config);
	return client;
}

function forever() {
	setInterval(() => {}, 60_000 * 60);
}

class Client {
	constructor(config) {
		let ev = new EventEmitter(); // Event emitter

		// Override any logger
		// TODO
		config.logger = logger(ev);

		// Class variables
		// Saves config
		this.config = config;
		// Set client name
		this.clientName = config.clientName;
		// Create event emitter
		this.ev = ev;
		this.events = [];
		// This always has to be at the end
		this.sock = makeWASocket(config);

		// Bind necessary Baileys events
		this.bindInitEvents();
	}

	/* Features */
	reconnect() {
		this.ev.emit('reconnecting');
		// Fill new auth state
		this.config.auth = this.sock.authState;
		// Create new sock instance with new auth
		this.sock = makeWASocket(this.config);
		this.bindEvents();
	}
	logout() {}
	loadAccount() {}

	async send(to, message) {
		let jid = utils.phoneToJid(utils.normalizePhoneNumber(to));
		await this.sock.sendMessage(jid, { text: message });
	}

	async readMessages(keys) {
		// Input normalization
		if (!Array.isArray(keys)) {
			throw "keys must be messages array or keys array";
		}

		keys = keys.map((k) => {
			if (k.key) {
				return k.key;
			} else if (k.id && k.remoteJid) {
				return k;
			} else {
				throw "Invalid message key driven for read receipt";
			}
		});

		await this.sock.readMessages(keys);
	}

	/* Events */
	on(event, cb) {
		// Read https://nodejs.dev/learn/the-nodejs-events-module#emitteron
		// This automatically APPEND callback to queue
		// of callbacks
		this.events.push({event, cb});
		this.sock.ev.on(event, cb);
	}

	bindEvents() {
		// Bind every Baileys event that has been binded before
		for (const handler of this.events) {
			this.sock.ev.on(handler.event, handler.cb);
		}
	}

	bindInitEvents() {
		// Emits logged out, logged in, reconnect events
		this.on('connection.update', (update) => {
			const { connection, isNewLogin, lastDisconnect } = update;

			if (connection == "open") {
				// When client loggedin
				// ref: 0a331ceab3b09d154c708e75a2be398664f86c4f/src/Socket/socket.ts#L525-L536
				this.ev.emit('loggedin');
			} if (connection == "connecting") {
				// Connecting to Whatsapp Server
				this.ev.emit('connecting');
			} else if (isNewLogin) {
				// QR Code scanned
				this.ev.emit('qrscanned');
			} else if (connection == "close") {
				// Either reconnect or logged out
				let DisconnectReason = Baileys.DisconnectReason;
				let t = lastDisconnect;
				let statusCode = 0;

				if (t && t.error && t.error.output && t.error.output.statusCode) {
					statusCode = t.error.output.statusCode;
				}

				if (statusCode === DisconnectReason.restartRequired) {
					// Reconnect required
					// especially after QR Code Scanned
					this.reconnect();
				} else if (statusCode === DisconnectReason.loggedOut) {
					// User logged out the device
					this.ev.emit('loggedout');
				} else if (statusCode === 515) {
					// Stream error
					this.reconnect();
				} else if (statusCode === 401) {
					// Unauthorized
					this.reconnect();
				}
			}
		});
	}

	onQRUpdated(cb) {
		this.on('connection.update', (update) => {
			if (update.qr) {
				// `qr` is an array of information concatenated by comma (,)
				QR.generate(update.qr, ({ small: true }), function(qr) {
					cb(
						// Here, we can generate QR as ASCII art
						qr,

						// Here, i append additional argument
						// so you can be creative on the QR.
						//
						// This, is the raw data to be encoded as QR
						update.qr
					);
				});
			}
		});
	}

	onQRScanned(cb) {
		this.ev.on('qrscanned', cb);
	}

	onLoggedIn(cb) {
		this.ev.on('loggedin', cb);
	}

	onLoggedOut(cb) {
		this.ev.on('loggedout', cb);
	}

	onMessage(cb, mode=2) {
		this.on('messages.upsert', async (data) => {
			let { messages, type } = data;
			// First, check if the message are
			// newly sent while client are alive
			if (type !== "notify") {
				// If not, pass
				return;
			}

			// Then, iterate each message from
			// `messages` array
			for (const _msg of messages) {
				// Check callback mode
				if (mode === 1 && _msg.key.fromMe === true) {
					// Expected incoming message, but we get outcoming one
					continue;
				} else if (mode === 0 && _msg.key.fromMe === false) {
					// Expected outcoming message, but we get incoming one
					continue;
				} // mode === 2 ignore, its a wildcard.

				// Send them to user callback
				let msg = new Messages.Message(_msg);
				let inner = _msg.message;

				// Basic text message
				if (inner) {
					if (inner.conversation || inner.extendedTextMessage) {
						msg = new Messages.TextMessage(_msg);
					}
				}

				// Initialize reference variables
				msg.me = this;
				msg.from = msg.from || this.sock.user.id;

				// Initialize Chat reference
				let chat;
				if (utils.isJidGroupChat(_msg.key.remoteJid)) {
					chat = await Chat.Group.fromJid(this.sock, _msg.key.remoteJid);
				} else if (utils.isJidRegularChat(_msg.key.remoteJid)) {
					chat = new Chat.Chat();
					// TODO: Get Chat Name
					//chat.name = msg.senderName;
				}

				chat.id = _msg.key.remoteJid;
				chat.me = this;
				// Put reference
				msg.chat = chat;

				// Send to callback
				cb(msg);
			}
		});
	}

	onIncomingMessage(cb) {
		this.onMessage(cb, 1);
	}

	onOutcomingMessage(cb) {
		this.onMessage(cb, 0);
	}

	onReconnect(cb) {
		this.ev.on('reconnecting', cb);
	}

	onLogs(cb) {
		this.ev.on('logs', cb);
	}
}

module.exports = {
	create,
	forever,
	Client,

	auth,
	storage,
	logger,
	utils,

	Messages
};
