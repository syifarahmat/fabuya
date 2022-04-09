const axios = require('axios');

/**
 * Instead of relying on Baileys' method,
 * lets fetch directly from whatsapp
 */
async function getWhatsappVersion() {
	let res = await axios.get("https://web.whatsapp.com/check-update?version=2.2210.9&platform=web");

	if (res.status == 200) {
		let data = JSON.parse(res.data);
		let version = data.currentVersion.split('.');
		return version.map(n => Number(n));
	}

	// Fallback is set manually
	return [2, 2210, 9];
}

function normalizePhoneNumber(phone) {
	// Replace non numbers
	let normalized = phone.replace(/\D/g, '');
	return normalized;
}

function phoneToJid(phone) {
	// Concat phone number with @c.us
	// stands for Chat
	return `${phone}@c.us`;
}

module.exports = {
	normalizePhoneNumber,
	phoneToJid
};
