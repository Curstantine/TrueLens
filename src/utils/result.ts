import type { TRPCError } from "@trpc/server";

type Result<T, E = unknown> = { value: T; error: null } | { value: null; error: E };

export async function makeResult<E, T>(
	fn: () => T | Promise<T>,
	errFn: ((err: unknown) => E) | null = null,
): Promise<Result<T, E>> {
	try {
		return { value: await fn(), error: null };
	} catch (error) {
		const errValue: E = errFn ? errFn(error) : (error as E);
		return { value: null, error: errValue };
	}
}

export function makeTRPCResult<T>(fn: () => T | Promise<T>): Promise<Result<T, TRPCError>> {
	return makeResult(fn, (e) => e as TRPCError);
}
