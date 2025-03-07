import Avatar from "~/app/_components/Avatar";
import { DateTimeSpan } from "~/app/_components/DateSpan";
import { getInitials } from "~/utils/grammar";

type Props = { userName: string; userAvatar: string; content: string; createdAt: Date };

export default function CommentCard({ userName, userAvatar, content, createdAt }: Props) {
	return (
		<div className="flex flex-col gap-2">
			<div className="inline-flex items-center gap-2">
				<Avatar
					avatarUrl={userAvatar}
					alt={userName}
					initials={getInitials(userName)}
					className="!size-7 text-xs"
				/>
				<span className="text-sm text-muted-foreground">{userName}</span>
			</div>

			<p className="flex-1 text-sm whitespace-break-spaces">{content}</p>

			<div className="flex items-center justify-between">
				<DateTimeSpan value={createdAt} className="text-xs text-muted-foreground" />
			</div>
		</div>
	);
}
