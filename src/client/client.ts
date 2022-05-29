import EventEmitter from 'events'

import makeWASocket from '../../Baileys'
import { useMultiFileAuthState } from '../../Baileys'
import type { WASocket, WAMessage, AnyRegularMessageContent, MiscMessageGenerationOptions } from '../../Baileys'
import { WAMessageKey, BinaryNode } from '../../Baileys'
import { proto } from '../../Baileys'
import QR from 'qrcode-terminal'

import logger from '../logger'
import { Message, GenericMessage } from '../message'
import * as utils from '../utils'

import { generateMessageObject, bindInternalConnectionEvents, bindMessageTraffic, getSentMessageByKey } from './binds'
import { MessageDirection } from './enums'
import { changeProfilePicture, fetchProfilePictureUrl, changePushName, changeStatus } from './profile'

export interface EventEntry {
	event: string;
	callback: (...args: any[]) => void;
};

export interface Config {
	// TODO
};

export type ClientT = InstanceType<typeof Client>;

export class Client {
	name: string = "WAClient";
	config: any = {};
	logger: ReturnType<typeof logger>;
	ev: InstanceType<typeof EventEmitter>;
	sentMessages: Array<WAMessage> = [];

	private events: Array<EventEntry> = [];
	sock: WASocket;
	query: (node: BinaryNode, timeout?: number) => Promise<BinaryNode>;

	bindInitEvents: () => void;
	bindEvents: () => void;
	on: (event: string, cb: any) => void;
	onQRUpdated: (cb: ((qr: string, data: string | object) => void)) => void;
	onQRScanned: (cb: (() => void)) => void;
	onLoggedIn: (cb: (() => void)) => void;
	onLoggedOut: (cb: (() => void)) => void;
	onMessage: (cb: ((msg: GenericMessage) => void), mode: MessageDirection) => void;
	onIncomingMessage: (cb: (msg: GenericMessage) => void) => void;
	onOutcomingMessage: (cb: (msg: GenericMessage) => void) => void;
	onReconnect: (cb: (() => void)) => void;
	onLogs: (cb: ((msg: any) => void)) => void;

	reconnect: () => void;
	logout: () => void;
	loadAccount: () => void;
	send: (to: string, message: string) => Promise<GenericMessage>;
	readMessages: (keys: Array<WAMessageKey>) => Promise<void>;

	_send: (to: string, message: AnyRegularMessageContent, options?: MiscMessageGenerationOptions) => Promise<GenericMessage>;

	setProfilePicture: (newPicture: Buffer) => Promise<void>;
	getProfilePicture: () => Promise<string>;
	setPushName: (newName: string) => Promise<BinaryNode>;
	setBio: (newStatus: string) => Promise<void>;

	constructor(config: any) {
		this.ev = new EventEmitter();

		this.config = config;
		this.name = config.name ?? "WAClient";

		this.config.logger = this.logger = logger(this.ev, this.config);

		if (this.config.getMessage === undefined) {
			this.config.getMessage = getSentMessageByKey.bind(this);
		} else {
			// Use both user-defined getMessage
			// and fabuya's getMessage, in user-first order.
			this.config.getMessage = async (key: proto.IMessageKey) => {
				let a = await this.config.getMessage(key);
				return a || (await getSentMessageByKey.call(this, key));
			};
		}

		this.sock = makeWASocket(this.config);
		this.bindInitEvents();
	}
};

Client.prototype.query = async function query(node: BinaryNode, timeout?: number): Promise<BinaryNode> {
	return await this.sock.query(node, timeout);
};

Client.prototype.bindEvents = function bindEvents(): void {
	for (const event of this.events) {
		this.sock.ev.on(event.event, event.callback);
	}
};

Client.prototype.bindInitEvents = function bindInitEvents(): void {
	// logout, login, reconnect
	bindInternalConnectionEvents.call(this);
};

//////////////////////////////////////////
// EVENT LISTENERS
//////////////////////////////////////////
Client.prototype.on = function on(event: string, cb: any) {
	this.events.push({event, callback: cb});
	this.sock.ev.on(event, cb);
};

Client.prototype.onQRUpdated = function onQRUpdated(cb: ((qr: string, data: string | object) => void)) {
	this.on('connection.update', ({ qr }) => {
		if (!qr) return;

		QR.generate(qr, ({ small: true }), function (_qr) {
			cb(_qr, qr);
		});
	});
};

Client.prototype.onQRScanned = function onQRScanned(cb: (() => void)) {
	this.ev.on('qrscanned', cb);
};

Client.prototype.onLoggedIn = function onLoggedIn(cb: (() => void)) {
	this.ev.on('loggedin', cb);
};

Client.prototype.onLoggedOut = function onLoggedOut(cb: (() => void)) {
	this.ev.on('loggedout', cb);
};

// Message
Client.prototype.onMessage = function onMessage(cb: ((msg: GenericMessage) => void), mode: MessageDirection = 2) {
	bindMessageTraffic.call(this, cb, mode);
};

Client.prototype.onIncomingMessage = function onIncomingMessage(cb: (msg: GenericMessage) => void) {
	this.onMessage(cb, MessageDirection.INCOMING);
};

Client.prototype.onOutcomingMessage = function onOutcomingMessage(cb: (msg: GenericMessage) => void) {
	this.onMessage(cb, MessageDirection.OUTCOMING);
};

// Network
Client.prototype.onReconnect = function onReconnect(cb: () => void) {
	this.ev.on('reconnecting', cb);
};

// Misc
Client.prototype.onLogs = function onLogs(cb: (msg: any) => void) {
	this.ev.on('logs', cb);
};

//////////////////////////////////////////
// FEATURES
//////////////////////////////////////////
Client.prototype.reconnect = function reconnect(): void {
	this.ev.emit("reconnecting");
	this.config.auth = this.sock.authState;
	this.sock = makeWASocket(this.config);
	this.bindEvents();
};

Client.prototype.logout = function logout(): void {
	throw new Error("Client.logout() method has not yet been implemented.");
};

Client.prototype.loadAccount = function loadAccount(): void {
	throw new Error("Client.loadAccount() method has not yet been implemented.");
};

Client.prototype._send = async function _send(to: string, message: AnyRegularMessageContent, options?: MiscMessageGenerationOptions): Promise<GenericMessage> {
	let msg: WAMessage = await this.sock.sendMessage(to, message, options);
	let index = this.sentMessages.push(msg) - 1;
	let retval: GenericMessage = await generateMessageObject.call(this, msg);

	// Remove the sent message from temporary store
	setTimeout((() => { utils.array_remove_index(this.sentMessages, index) }).bind(this), this.config.clearCacheDelay);

	return retval;
};

Client.prototype.send = async function send(to: string, message: string): Promise<GenericMessage> {
	return await this._send(to, { text: message });
};

Client.prototype.readMessages = async function readMessages(keys: Array<WAMessageKey>): Promise<void> {
	await this.sock.readMessages(keys);
};

// Profile features
Client.prototype.setProfilePicture = changeProfilePicture;
Client.prototype.getProfilePicture = fetchProfilePictureUrl;
Client.prototype.setPushName = changePushName;
Client.prototype.setBio = changeStatus;

//////////////////////////////////////////
// STANDALONE FUNCTIONS
//////////////////////////////////////////
export async function create(name: string = "WAClient", config: any = {}): Promise<InstanceType<typeof Client>>{
	let saveCreds: any;
	config.name = config.name ?? name;

	if (config.version === undefined) {
		let version: Array<number | string> = await utils.getWhatsappVersion();
		config.version = version;
	}

	if (config.browser === undefined) {
		config.browser = [name, "Chrome", "10.0"];
	}

	if (config.auth === undefined) {
		const { state, saveCreds: saveCreds_ } = await useMultiFileAuthState(name + "_auth_info")
		saveCreds = saveCreds_;
		config.auth = state;
	}

	if (config.clearCacheDelay === undefined) {
		config.clearCacheDelay = 1000 * 60;
	}

	let client = new Client(config);
	if (saveCreds) {
		client.on("creds.update", saveCreds);
	}

	return client;
};

export function forever() {
	setInterval(() => {}, 60_000 * 60);
};
