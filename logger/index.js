const pino = require('pino');

function makeLogger(EventEmitter) {
	let destination = {
		write(str) {
			let json = JSON.parse(str);
			EventEmitter.emit('logs', json);
		}
	};
	const logger = pino({}, destination);

	return logger;
}

module.exports = makeLogger;