const BASE_62_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const generateID = () => {
	const encodeBase62 = (n: number) => {
		let out = "";
		while (n > 0) {
			out = BASE_62_CHARSET[n % 62] + out;
			n = Math.floor(n / 62);
		}
		return out;
	};

	const timestamp = Date.now();
	const entropy = Math.floor(Math.random() * 62 ** 6);

	const encodedTimestamp = encodeBase62(timestamp);
	const encodedEntropy = encodeBase62(entropy);

	return (encodedTimestamp + encodedEntropy).padEnd(15, "0").slice(0, 15);
};

export const decodeTimestampFromID = (id: string) => {
	const decodeBase62 = (s: string) => {
		let n = 0;
		for (let i = 0; i < s.length; i++) {
			n = n * 62 + BASE_62_CHARSET.indexOf(s[i]);
		}
		return n;
	};

	const encodedTimestamp = id.slice(0, id.length - 6);
	return decodeBase62(encodedTimestamp);
};
