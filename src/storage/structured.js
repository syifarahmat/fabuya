const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const events = require('events');

const utils = require('../utils');
const Chat = require('../Chat');

function hash(s) {
	return crypto.createHash('sha256').update(s).digest('hex');
}

class MessageCluster {
	constructor() {
		this.messages = [];
		this.filename = '';
	}

	addMessage(msg) {
		// TODO: Add pre-processing upon adding message to MessageCluster
		this.messages.push(msg);
	}

	write() {
		fs.writeFileSync(this.filename, JSON.stringify(this.messages));
	}
}

class structured {
	constructor(saveDir, options={}) {
		this.saveDir = saveDir;
		this.me = undefined;

		// One file, one block
		// You ask for blockchain implementation? DIY bro
		this.messageBlockSize = options.messageBlockSize || 10;

		// Initialize folders
		fs.mkdirSync(path.join(saveDir, 'chats'), {recursive: true});
		fs.mkdirSync(path.join(saveDir, 'messages'), {recursive: true});
	}

	getChat(jid) {
		let raw, data, chat;
		let pathToChat = path.join(this.saveDir, "chats", hash(jid));
		let exists = fs.existsSync(pathToChat);

		if (!exists) {
			return null;
		}

		// Chat exists

		raw = fs.readFileSync(pathToChat);
		data = JSON.parse(raw);

		// Check if chat is a group or regular chat
		if (data.isGroup) {
			chat = new Chat.Group();

			let groupMeta = utils.parseGroupJid(jid);
			chat.creator = groupMeta.creator;
			chat.createdAt = groupMeta.createdAt;
		} else {
			chat = new Chat.Chat();
		}

		chat.name = data.name;
		chat.id = data.id;
		chat.me = this.me;

		return chat;
	}

	getChatLatestMessages(jid, amount) {
		let raw, data, chat;
		let pathToChat = path.join(this.saveDir, "messages", hash(jid));
		let exists = fs.existsSync(pathToChat);

		if (!exists) {
			return null;
		}

		// Chat exists

		let filenames = fs.readdirSync(pathToChat);
		filenames.sort((a, b) => Number(a) + Number(b)); // Reverse the order

		// Read last message db file
		let last = filenames[filenames.length-1];
		raw = fs.readFileSync(last);
		data = raw.split('\n').map(l => Message.fromJSON(l));

		let retval = [];
		for (let i = 0; i < amount; i++) {
			let msg = data.pop();
			if (msg === undefined) return retval;
			retval.push(msg);
		}

		return retval;
	}

	bindClient(client) {
		this.me = client;
		let ev = new events();

		// Retrieve contacts
		ev.on('chatsynced', () => {
			client.on('contacts.set', (data) => {
				data.contacts.forEach((contact) => {
					let savePath = path.join(
						this.saveDir, 'chats', contact.id.replace('@', '-')
					);

					let exists = fs.existsSync(savePath);
					if (!exists) return;

					let raw = fs.readFileSync(savePath);
					let data = JSON.parse(raw);

					// .name is their contact name that we save
					// Meanwhile notify is the one they set by themself
					data.name = contact.name || contact.notify;

					fs.writeFileSync(savePath, JSON.stringify(data));
				});
			});
		});

		// Retrieve chats
		client.on('chats.set', (data) => {
			if (data.isLatest) {
				// Clear all chat files
				let filenames = fs.readdirSync(path.join(this.saveDir, "chats"));
				for (const filename of filenames) {
					fs.unlinkSync(path.join(this.saveDir, "chats", filename));
				}

				// Fill with new data
				for (const conversation of data.chats) {
					if (!conversation) continue;
					let chat;

					if (utils.isJidGroupChat(conversation.id)) {
						chat = new Chat.Group();
						chat.name = conversation.name;

						if (!conversation.readOnly) {
							let meta = utils.parseGroupJid(conversation.id);
							chat.creator = meta.creator;
							chat.createdAt = meta.createdAt;
						}
					} else if (utils.isJidRegularChat(conversation.id)) {
						chat = new Chat.Chat();
						// TODO: Get Regular Chat contact name,
						// maybe contacts.set helps this?
					}

					if (chat === undefined) {
						continue;
					}

					chat.id = conversation.id;

					let savePath = path.join(
						this.saveDir, 'chats', conversation.id.replace('@', '-')
					);

					fs.writeFileSync(savePath, JSON.stringify(chat));
				}

				ev.emit('chatsynced');
			}
		});

		// Sync messages
		client.on('messages.set', (data) => {
			let clusters = {};
//			let _filenames = fs.readdirSync(path.join(this.saveDir, 'messages'));
//			if (_filenames.length == 0) data.isLatest = true;
			if (data.isLatest) {
				// Clean messages dir
				let filenames = fs.readdirSync(path.join(this.saveDir, 'messages'));
				for (const filename of filenames) {
					fs.unlinkSync(filename);
				}

				// Cluster messages
				for (const msg of data.messages) {
					let chatOrigin = msg.key.remoteJid;
					let chatCluster = clusters[chatOrigin];
					let cluster = undefined;

					function lastCluster() {
						return chatCluster[chatCluster.length-1];
					}

					if (chatCluster === undefined) {
						clusters[chatOrigin] = [];
						chatCluster = clusters[chatOrigin];
					}

					if (chatCluster.length === 0) {
						chatCluster.push(new MessageCluster(chatOrigin.replace('@', '-')));
					}
					cluster = lastCluster();

					if (cluster.messages.length + 1 === this.messageBlockSize) {
						// Require us to make new cluster
						chatCluster.push(new MessageCluster(chatOrigin.replace('@', '-')));
						cluster = lastCluster();
					}

					// Push to cluster
					cluster.addMessage(msg);
				}

				// Save clusters
				for (const id of Object.keys(clusters)) {
					for (let i = 0; i < clusters[id].length; i++) {
						let cluster = clusters[id][i];
						cluster.filename = path.join(
							this.saveDir, 'messages',
							id.replace('@', '-') + `.${i}`
						);
						cluster.write();
					}
				}
			} else {
				// Not latest

				for (const msg of data.messages) {
					let chatOrigin = msg.key.remoteJid;

					let filenames = fs.readdirSync(path.join(this.saveDir, "messages"));

					let ours = [];
					for (const filename of filenames) {
						if (!filename.startsWith(chatOrigin.replace('@', '-'))) continue;
						ours.push(filename);
					}

					let latest = ours[ours.length-1];
					let saveFile = '';

					if (!latest) {
						latest = chatOrigin.replace('@', '-') + '.0';
						saveFile = path.join(this.saveDir, "messages", latest);
						fs.writeFileSync(saveFile, '[]');
					} else {
						saveFile = path.join(this.saveDir, "messages", latest);
					}

					let raw = fs.readFileSync(saveFile);
					let data = JSON.parse(raw);

					let cluster = new MessageCluster();
					cluster.messages = data;

					// Check if max block size reached
					if (cluster.messages.length + 1 === this.messageBlockSize) {
						cluster = new MessageCluster();

						let i = latest.split('.');
						i = Number(i[i.length-1]);

						saveFile = path.join(
							this.saveDir, "messages",
							chatOrigin.replace('@', '-') + '.' + String(i+1)
						);
					}

					cluster.addMessage(msg);
					cluster.filename = saveFile;
					cluster.write();
				}
			}
		});
	}

	async resync(since=0) {
		let node = {
			tag: 'iq',
			attrs: {
				to: '@s.whatsapp.net',
				type: 'set',
				xmlns: 'urn:xmpp:whatsapp:dirty',
				id: this.me.sock.generateMessageTag()
			},
			content: [{
				tag: 'clean',
				attrs: {
					type: 'account_sync',
					timestamp: since.toString()
				}
			}]
		};

		await this.me.sock.sendNode(node);
	}
}

module.exports = structured;
