export function countryCodeToUnicode(code: string) {
	return code
		.toUpperCase()
		.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function formatMetresToKm(m: number): string {
	return `${(m / 1000).toFixed(2)}km`;
}

export function iso3166ToCountryName(cc: string, id: number): string | undefined {
	const countryMap: Record<string, string> = {
		AU: "Australia",
		FR: "France",
		CN: "China",
		BH: "Bahrain",
		ES: "Spain",
		MC: "Monaco",
		CA: "Canada",
		GB: "United Kingdom",
		HU: "Hungary",
		BE: "Belgium",
		IT: "Italy",
		SG: "Singapore",
		JP: "Japan",
		AE: "United Arab Emirates",
		US: "United States",
		BR: "Brazil",
		AT: "Austria",
		MX: "Mexico",
		AZ: "Azerbaijan",
		NL: "Netherlands",
		PT: "Portugal",
		SA: "Saudi Arabia",
		QA: "Qatar",
	};

	if (cc === "US") {
		switch (id) {
			case 15:
				return "United States (Texas)";
			case 30:
				return "United States (Miami)";
			case 31:
				return "United States (Las Vegas)";
		}
	}

	return countryMap[cc];
}
