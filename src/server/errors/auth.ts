import { CredentialsSignin } from "next-auth";

export class InvalidCredentialLogin extends CredentialsSignin {
	constructor(code: string, message: string) {
		super(message);
		this.code = code;
		this.message = message;
	}
}

export class InvalidCredentialSignup extends Error {
	name = "InvalidCredentialSignup";
	code: string;

	constructor(code: string, message: string) {
		super(message);
		this.code = code;
	}
}
