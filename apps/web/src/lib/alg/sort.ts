Array.prototype.quickSort = function <T>(this: T[], cmp?: (a: T, b: T) => number): T[] {
	quickSort(this, cmp);
	return this;
};

export function quickSort<T>(
	arr: T[],
	cmp?: (a: T, b: T) => number,
	low = 0,
	high = arr.length - 1,
): void {
	let realCmp: (a: T, b: T) => number;

	if (cmp === undefined && typeof arr[0] === "number") {
		realCmp = (a: T, b: T) => (a as number) - (b as number);
	} else if (cmp === undefined) {
		throw new Error("Comparison function is required for non-numeric arrays");
	} else {
		realCmp = cmp;
	}

	if (low < high) {
		const pivot = split(arr, realCmp, low, high);
		quickSort(arr, cmp, low, pivot - 1); // left
		quickSort(arr, cmp, pivot + 1, high); // right
	}
}

function split<T>(arr: T[], cmp: (a: T, b: T) => number, low: number, high: number) {
	let pivot = arr[high];
	let i = low;

	// Iterate through between low and high
	// If el is smaller than pivot, swap
	for (let j = low; j < high; j++) {
		if (cmp(arr[j], pivot) < 0) {
			[arr[i], arr[j]] = [arr[j], arr[i]];
			i++;
		}
	}

	// lock the pivot in and return
	[arr[i], arr[high]] = [arr[high], arr[i]];
	return i;
}
