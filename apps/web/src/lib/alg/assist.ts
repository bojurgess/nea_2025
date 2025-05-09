import type { Telemetry } from "$lib/types";

export function decodeAssists(mask: number): Telemetry.Assists {
	return {
		steering_assist: Boolean(mask & 0b0000_0000_0000_0001 ? 1 : 0),
		braking_assist: (mask & 0b0000_0000_0000_0110) >> 1,
		gearbox_assist: (mask & 0b0000_0000_0001_1000) >> 3,
		pit_assist: Boolean((mask & 0b0000_0000_0010_0000) >> 5),
		pit_release_assist: Boolean((mask & 0b0000_0000_0100_0000) >> 6),
		ers_assist: Boolean((mask & 0b0000_0000_1000_0000) >> 7),
		drs_assist: Boolean((mask & 0b0000_0001_0000_0000) >> 8),
		dynamic_racing_line: (mask & 0b0000_0110_0000_0000) >> 10,
		traction_control: (mask & 0b0001_1000_0000_0000) >> 12,
		anti_lock_brakes: Boolean((mask & 0b0010_0000_0000_0000) !== 0), // convert to boolean
	};
}

export function formatAssist(name: string, value: number | boolean) {
	if (typeof value === "boolean") {
		return `${name}: ${value ? "On" : "Off"}`;
	} else if (name === "Dynamic Racing Line") {
		switch (value) {
			case 0:
				return `${name}: Off`;
			case 1:
				return `${name}: Corners Only`;
			case 2:
				return `${name}: Full`;
			default:
				return `${name}: Unknown (${value})`;
		}
	} else if (name === "Braking Assist") {
		switch (value) {
			case 0:
				return `${name}: Off`;
			case 1:
				return `${name}: Low`;
			case 2:
				return `${name}: Medium`;
			case 3:
				return `${name}: High`;
			default:
				return `${name}: Unknown (${value})`;
		}
	} else if (name === "Gearbox Assist") {
		switch (value) {
			case 1:
				return `Gearbox: Manual`;
			case 2:
				return `Gearbox: Manual With Suggested Gear`;
			case 3:
				return `Gearbox: Automatic`;
			default:
				return `Gearbox: Unknown (${value})`;
		}
	} else if (name === "Traction Control") {
		switch (value) {
			case 0:
				return `${name}: Off`;
			case 1:
				return `${name}: Medium`;
			case 2:
				return `${name}: Full`;
			default:
				return `${name}: Unknown (${value})`;
		}
	}
}
