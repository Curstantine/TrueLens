"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useMemo } from "react";
import { UserRole } from "@prisma/client";

import { api } from "~/trpc/react";
import { asReadableUserRole } from "~/utils/grammar";

import EditSquareOutlineRounded from "~/app/_components/icons/material/EditSquareOutlineRounded";
import PersonAddOutlineRoundedIcon from "~/app/_components/icons/material/PersonAddOutlineRounded";
import { PersonRemoveOutlineRoundedIcon } from "~/app/_components/icons/material/PersonRemoveOutlineRounded";

type EditLinkProps = { id: string };
export function EditLink({ id }: EditLinkProps) {
	api.user.getById.usePrefetchQuery({ id }, { staleTime: 600000 });

	return (
		<Link href={`/admin/users/${id}`}>
			<EditSquareOutlineRounded className="size-5" />
		</Link>
	);
}

type PromoteUserButtonProps = Pick<EditLinkProps, "id"> & { role: UserRole };
export function PromoteUserButton({ id, role }: PromoteUserButtonProps) {
	const [promoting, promotingName] = useMemo(() => {
		let value: UserRole;
		switch (role) {
			case UserRole.USER:
				value = UserRole.MODERATOR;
				break;
			case UserRole.MODERATOR:
				value = UserRole.ADMIN;
				break;
			default:
				return [null, null];
		}

		return [value, asReadableUserRole(value)];
	}, [role]);

	const utils = api.useUtils();
	const promoteUser = api.user.changeRole.useMutation({
		onError: (e) => {
			if (promoting === null) return;
			toast.error(`Failed to promote the user to ${promotingName}`, {
				description: e.message,
			});
		},
		onSuccess: () => {
			if (promoting === null) return;
			utils.user.getAll.invalidate();
			toast.success(`Successfully promoted the user to ${promotingName}`);
		},
	});

	return (
		<button
			type="button"
			title={`Promote user to ${promotingName}`}
			disabled={promoting === null}
			onClick={() => {
				if (promoting === null) return;
				promoteUser.mutate({ id, role: promoting });
			}}
			className="transition-[opacity,color] disabled:opacity-50"
		>
			<PersonAddOutlineRoundedIcon className="size-5" />
		</button>
	);
}

export function DemoteUserButton({ id, role }: PromoteUserButtonProps) {
	const [promoting, promotingName] = useMemo(() => {
		let value: UserRole;
		switch (role) {
			case UserRole.ADMIN:
				value = UserRole.MODERATOR;
				break;
			case UserRole.MODERATOR:
				value = UserRole.USER;
				break;
			default:
				return [null, null];
		}

		return [value, asReadableUserRole(value)];
	}, [role]);

	const utils = api.useUtils();
	const demoteUser = api.user.changeRole.useMutation({
		onError: (e) => {
			if (promoting === null) return;
			toast.error(`Failed to demote the user to ${promotingName}`, {
				description: e.message,
			});
		},
		onSuccess: () => {
			if (promoting === null) return;
			utils.user.getAll.invalidate();
			toast.success(`Successfully demoted the user to ${promotingName}`);
		},
	});

	return (
		<button
			type="button"
			title={`Demote user to ${promotingName}`}
			disabled={promoting === null}
			onClick={() => {
				if (promoting === null) return;
				demoteUser.mutate({ id, role: promoting });
			}}
			className="transition-[opacity,color] disabled:opacity-50"
		>
			<PersonRemoveOutlineRoundedIcon className="size-5" />
		</button>
	);
}
