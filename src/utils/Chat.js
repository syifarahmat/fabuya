
const validDomains = ["c.us", "g.us", "broadcast", "s.whatsapp.net"];

function isValidJid(jid) {
	let comp = jid.split('@');

	if (comp.length != 2) return false;
	if (!validDomains.includes(comp[1])) return false;

	let numbers = comp[0].split('-');
	// Neither chat, broadcast or group
	if (numbers.length > 2) return false;
	// Group created from the future is not possible
	if (Number(numbers[1]) > (Date.now() / 1000)) return false;
	// Broadcast channel created from the future, not possible
	if (comp[1] == "broadcast" && Number(numbers[0]) > (Date.now() / 1000)) return false;

	return true;
}

function isJidRegularChat(jid) {
	if (!isValidJid(jid)) return false;
	let comp = jid.split('@');

	if (comp[1] != "c.us" && comp[1] != "s.whatsapp.net") return false;

	return true;
}

function isJidGroupChat(jid) {
	if (!isValidJid(jid)) return false;
	let comp = jid.split('@');

	if (comp[1] != "g.us") return false;

	return true;
}

function parseGroupJid(jid) {
	if (!isValidJid(jid)) return false;
	let comp = jid.split('@')[0].split('-');

	return {
		creator: comp[0],
		createdAt: Number(comp[1])
	};
}

module.exports = {
	isValidJid,
	isJidRegularChat,
	isJidGroupChat,
	parseGroupJid
};
