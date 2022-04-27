let Chat = require('./Chat');

class Group extends Chat {
	constructor() {
		super();
		this.isGroup = true;

		this.creator = '0';
		this.createdAt = 0;

		this.properties.push('creator');
		this.properties.push('createdAt');
	}
}

module.exports = Group;
