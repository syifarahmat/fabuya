import axios from 'axios';

export async function getWhatsappVersion(): Promise<Array<number | string>> {
	let res = await axios.get("https://web.whatsapp.com/check-update?version=2.2210.9&platform=web");

	if (res.status == 200) {
		let data = res.data;
		let version = data.currentVersion.split('.');
		return version.map(n => n as number);
	}

	return [2, 2210, 9];
};

export function deepEqual(a, b): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
};
