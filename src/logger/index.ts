import pino from 'pino'
import EventEmitter from 'events'

export default function makeLogger(ev: InstanceType<typeof EventEmitter>, config: any) {
	let destination = {
		write(str) {
			let json = JSON.parse(str);
			ev.emit('logs', json);
		}
	};
	const logger = pino({ level: 'debug' }, destination);

	return logger;
};
