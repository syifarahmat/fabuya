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
