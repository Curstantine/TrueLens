/**
 * Returns this value if it satisfies the given {@link predicate} or null, if it doesn't.
 *
 * @returns T | null
 * @see https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-if.html
 */
export function takeIf<T>(source: T, predicate: boolean | ((value: T) => boolean)): T | null {
	const condition = typeof predicate === "function" ? predicate(source) : predicate;
	return condition ? source : null;
}

/**
 * Returns this value if it doesn't satisfy the given {@link predicate} or null, if it does.
 *
 * @param {T} source
 * @param {(value: T) => boolean} predicate
 *
 * @returns T | null
 * @see https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-unless.html
 */
export function takeUnless<T>(source: T, predicate: (value: T) => boolean): T | null {
	return takeIf(source, (x) => !predicate(x));
}
