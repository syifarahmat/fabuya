let Chat = require('./Chat');

class Group extends Chat {
	constructor() {
		super();

		this.creator = '0';
		this.createdAt = 0;
	}
}

module.exports = Group;
