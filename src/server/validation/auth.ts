import { z } from "zod";
import { getCountryData, TCountryCode } from "countries-list";

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const registerSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const registerCompleteSchema = z.object({
	userId: z.string(),
	name: z.string().min(2),
	country: z.string().refine(
		(data) => !!getCountryData(data as TCountryCode),
		(data) => ({ message: `${data} is not a valid country code` }),
	),
});
