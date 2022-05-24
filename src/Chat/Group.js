let Chat = require('./Chat');

class Group extends Chat {
	constructor() {
		super();
		this.isGroup = true;

		this.creator = '0';
		this.createdAt = 0;

		// TODO: desc
		// TODO: isOnlyAdmins
		// TODO: isSettingsOpen
		// TODO: members getter

		this.properties.push('creator');
		this.properties.push('createdAt');
	}

	static async fromJid(sock, jid) {
		let data = await sock.groupMetadata(jid);
		let g = new Group();

		g.id = data.id;
		g.name = data.subject;
		g.creator = data.owner;
		g.createdAt = data.creation;

		return g;
	}
}

module.exports = Group;
