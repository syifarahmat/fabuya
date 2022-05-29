export function array_remove_index(array: any[], index: number): void {
	let a = array.splice(index);
	a.shift();
	for (const i of a) {
		array.push(i);
	}
}
