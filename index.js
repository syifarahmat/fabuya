const EventEmitter = require('events');
const stream = require('stream');

const Baileys = require('./baileys-lib');
const QR = require('qrcode-terminal');

const logger = require('./logger');
const utils = require('./utils');

const Message = require('./Message');

const makeWASocket = Baileys.default;

async function create(clientName, config={}) {
	// TODO: Default config filling
	// Fill with latest version if version is not defined
	if (config.version === undefined) {
		// Get latest Whatsapp version
		// TODO: Maybe try caching?
		let version = await Baileys.fetchLatestBaileysVersion();
		config.version = version.version;
	}

	// Make new Whatsapp socket
	let client = new Client(config);
	return client;
}

/**
 * Simple function to force NodeJS wait until SIGINT fires
 */
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
		// Create event emitter
		this.ev = ev;
		this.events = [];
		// This always has to be at the end
		this.sock = makeWASocket(config);

		// Bind necessary Baileys events
		this.#bindInitEvents();
	}

	/* Features */
	/**
	 * Self-explanatory, reconnect the client
	 */
	reconnect() {
		this.ev.emit('reconnecting');
		// Fill new auth state
		this.config.auth = this.sock.authState;
		// Create new sock instance with new auth
		this.sock = makeWASocket(this.config);
		this.#bindEvents();
	}
	logout() {}
	loadAccount() {}
	async send(to, message) {
		let jid = utils.phoneToJid(utils.normalizePhoneNumber(to));
		await this.sock.sendMessage(jid, { text: message });
	}

	/* Events */
	on(event, cb) {
		// Read https://nodejs.dev/learn/the-nodejs-events-module#emitteron
		// This automatically APPEND callback to queue
		// of callbacks
		this.events.push({event, cb});
		this.sock.ev.on(event, cb);
	}

	/**
	 * Private class
	 */
	#bindEvents() {
		// Bind every Baileys event that has been binded before
		for (const handler of this.events) {
			this.sock.ev.on(handler.event, handler.cb);
		}
	}

	#bindInitEvents() {
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
				let statusCode = lastDisconnect.error?.output?.statusCode;

				if (statusCode === DisconnectReason.restartRequired) {
					// Reconnect required
					// especially after QR Code Scanned
					this.reconnect();
				} else if (statusCode === DisconnectReason.loggedOut) {
					// User logged out the device
					this.ev.emit('loggedout');
				}
			}
		});
	}

	/**
	 * This event is emitted when there's new QR code
	 */
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
		})
	}

	/**
	 * This event is emitted when QR code is scanned
	 */
	onQRScanned(cb) {
		// TODO: Work on this
		this.ev.on('qrscanned', cb);
	}

	/**
	 * This event is emitted when user is logged in
	 */
	onLoggedIn(cb) {
		this.ev.on('loggedin', cb);
		// TODO: Work on this
	}

	/**
	 * This event is emitted when new message
	 * is being sent while client is alive
	 */
	onMessage(cb) {
		this.on('messages.upsert', (data) => {
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
				// Send them to user callback
				// TODO: Construct Message class
				let msg = Message.from(_msg);
				msg.me = this;
				cb(msg);
			}
		})
	}

	/**
	 * This events emittede when reconnect initiated
	 */
	onReconnect(cb) {
		this.ev.on('reconnecting', cb);
	}

	/**
	 * This event emitted whenever the core library `Baileys`
	 * is sending logs
	 */
	onLogs(cb) {
		this.ev.on('logs', cb);
	}
}

module.exports = {
	create,
	forever,
	Client
};