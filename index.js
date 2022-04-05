const EventEmitter = require('events');
const stream = require('stream');

const Baileys = require('./baileys-lib');
const QR = require('qrcode-terminal');

const auth = require('./src/auth');
const storage = require('./src/storage');

const logger = require('./src/logger');
const utils = require('./src/utils');

const Message = require('./src/Message');

const makeWASocket = Baileys.default;

/**
 * @function module:create
 * @param {string} clientName - Used for generating files and session identification
 * @param {Object} config - Baileys' extended configuration
 * @returns {Promise} Promise object repesents the created whatsapp client
 */
 // TODO: create `Configuration` class
async function create(clientName, config={}) {
	// TODO: Default config filling
	config.clientName = clientName;
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
 * @function module:forever
 * @description Simple function to force NodeJS wait until SIGINT fires
 */
function forever() {
	setInterval(() => {}, 60_000 * 60);
}

/**
 * Whatsapp client
 * @class module:fabuya.Client
 */
class Client {
	constructor(config) {
		let ev = new EventEmitter(); // Event emitter

		// Override any logger
		// TODO
		config.logger = logger(ev);

		// Class variables
		// Saves config
		/** @member {object} */
		this.config = config;
		// Set client name
		/** @member {string} */
		this.clientName = config.clientName;
		// Create event emitter
		/** @member {EventEmitter} */
		this.ev = ev;
		/** @member {Function[]} */
		this.events = [];
		// This always has to be at the end
		/** @member {Object} */
		this.sock = makeWASocket(config);

		// Bind necessary Baileys events
		this.#bindInitEvents();
	}

	/* Features */
	/**
	 * Self-explanatory, reconnect the client
	 * @method module:fabuya.Client#reconnect
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

	/**
	 * Send a message to a phone number
	 * @method module:fabuya.Client#send
	 * @param {string} to - Regular phone number, not Jid
	 * @param {string} message - The text you want to send
	 */
	async send(to, message) {
		let jid = utils.phoneToJid(utils.normalizePhoneNumber(to));
		await this.sock.sendMessage(jid, { text: message });
	}

	/* Events */
	/**
	 * Undocumented
	 * @method module:fabuya.Client#on
	 */
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
	 * Bind a callback to `onQRUpdated` event
	 * @method module:fabuya.Client#onQRUpdated
	 * @param {Function} cb - Event callback
	 * @fires module:fabuya.Client#qrupdated
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
		});

		/**
		 * onQRUpdated event
		 * @event module:fabuya.Client#qrupdated
		 * @param {string} qr - The QR code ascii art
		 * @param {string} data - The data to be encoded as QR
		 */
	}

	/**
	 * Bind a callback to `qrscanned` event
	 * @method module:fabuya.Client#onQRScanned
	 * @param {Function} cb - Event callback
	 * @fires module:fabuya.Client#qrscanned
	 */
	onQRScanned(cb) {
		// TODO: Work on this
		this.ev.on('qrscanned', cb);

		/**
		 * This event is emitted when the QR is scanned
		 * @event module:fabuya.Client#qrscanned
		 */
	}

	/**
	 * Bind a callback to `loggedin` event
	 * @method module:fabuya.Client#onLoggedIn
	 * @param {Function} cb - Event callback
	 * @fires module:fabuya.Client#loggedin
	 */
	onLoggedIn(cb) {
		this.ev.on('loggedin', cb);

		/**
		 * This event is emitted when user is logged in
		 * @event module:fabuya.Client#loggedin
		 */
	}

	/**
	 * Bind a callback to `onmessage` event
	 * @method module:fabuya.Client#onMessage
	 * @param {Function} cb - Event callback
	 * @fires module:fabuya.Client#onmessage
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
		});

		/**
		 * This event is emitted when new incoming/outgoing message
		 * is being sent while client is alive.
		 * This is not chat message, but rather a general network packet
		 * @event module:fabuya.Client#onmessage
		 * @param {Message}. msg - The packet message (WIP)
		 */
		// TODO: `Message` class should be only for chat messages, `PacketMessage` should be for this
	}

	/**
	 * Bind a callback to reconnecting event
	 * @method module:fabuya.Client#onReconnect
	 * @fires module:fabuya.Client#reconnecting
	 */
	onReconnect(cb) {
		this.ev.on('reconnecting', cb);

		/**
		 * This event is emitted when reconnecting initiated using
		 * {@link Client#reconnect} method
		 * @event module:fabuya.Client#reconnecting
		 */
	}

	/**
	 * Bind a callback to logger activities
	 * @method module:fabuya.Client#onLogs
	 * @fires module:fabuya.Client#logs
	 */
	onLogs(cb) {
		this.ev.on('logs', cb);

		/**
		 * This event emitted whenever the core library `Baileys`
	 	 * is sending logs
	 	 * @event module:fabuya.Client#logs
		 */
	}
}

/**
 * @module fabuya
 */
module.exports = {
	create,
	forever,
	Client,

	auth,
	storage,
	logger,
	utils,

	classes: {
		Message
	}
};
