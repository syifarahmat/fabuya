import EventEmitter from 'events'

import * as Baileys from '../../Baileys'
import makeWASocket from '../../Baileys'
import type { WASocket } from '../../Baileys'
import { WAMessageKey, BinaryNode } from '../../Baileys'
import QR from 'qrcode-terminal'

import logger from '../logger'
import { Message, Generic } from '../message'
import * as utils from '../utils'

import { bindInternalConnectionEvents, bindMessageTraffic } from './binds'
import { MessageDirection } from './enums'
import { changeProfilePicture, changePushName } from './profile'

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
	send: (to: string, message: string) => Promise<void>;
	readMessages: (keys: Array<WAMessageKey>) => Promise<void>;

	setProfilePicture: (newPicture: Buffer) => Promise<BinaryNode>;
	setPushName: (newName: string) => Promise<BinaryNode>;

	constructor(config: any) {
		this.ev = new EventEmitter();

		this.config = config;
		this.name = config.name ?? "WAClient";

		this.config.logger = this.logger = logger(this.ev, this.config);
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

Client.prototype.send = async function send(to: string, message: string): Promise<void> {
	await this.sock.sendMessage(to, { text: message });
};

Client.prototype.readMessages = async function readMessages(keys: Array<WAMessageKey>): Promise<void> {
	await this.sock.readMessages(keys);
};

// Profile features
Client.prototype.setProfilePicture = changeProfilePicture;
Client.prototype.setPushName = changePushName;

//////////////////////////////////////////
// STANDALONE FUNCTIONS
//////////////////////////////////////////
export async function create(name: string = "WAClient", config: any = {}): Promise<InstanceType<typeof Client>>{
	config.name = config.name ?? name;

	if (config.version === undefined) {
		let version: Array<number | string> = await utils.getWhatsappVersion();
		config.version = version;
	}

	if (config.browser) {
		config.browser = [name, "Chrome", "10.0"];
	}

	return new Client(config);
};

export function forever() {
	setInterval(() => {}, 60_000 * 60);
};
