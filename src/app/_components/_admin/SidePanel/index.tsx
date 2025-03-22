import Link from "next/link";

import Logo from "~/app/_components/icons/Logo";
import AdminSidePanelItem from "~/app/_components/_admin/SidePanel/Item";

import ArticleOutlineRoundedIcon from "~/app/_components/icons/material/ArticleOutlineRounded";
import CloudSyncOutlineRounded from "~/app/_components/icons/material/CloudSyncOutlineRounded";
import GroupOutlineRoundedIcon from "~/app/_components/icons/material/GroupOutlineRounded";
import HistoryEduOutlineRoundedIcon from "~/app/_components/icons/material/HistoryEduOutlineRounded";
import SpaceDashboardOutlineIcon from "~/app/_components/icons/material/SpaceDashboardOutline";

const BUILD_DATE = new Date();

export default function AdminSidePanel() {
	return (
		<div className="flex flex-col border-r border-r-border py-4 pr-2">
			<Link href="/admin" className="mb-6 inline-flex gap-1">
				<Logo className="ml-2 h-fit w-28" />
				<span className="text-xs">(Admin)</span>
			</Link>

			<AdminSidePanelItem
				href="/admin"
				label="Dashboard"
				icon={<SpaceDashboardOutlineIcon className="size-6" />}
			/>

			<ul className="mt-2">
				<span className="pl-2 text-xs font-medium text-muted-foreground">Content</span>
				<AdminSidePanelItem
					href="/admin/stories"
					label="Stories"
					icon={<HistoryEduOutlineRoundedIcon className="size-6" />}
				/>
				<AdminSidePanelItem
					href="/admin/articles"
					label="Articles"
					icon={<ArticleOutlineRoundedIcon className="size-6" />}
				/>
				<AdminSidePanelItem
					href="/admin/users"
					label="Users"
					icon={<GroupOutlineRoundedIcon className="size-6" />}
				/>
			</ul>

			<ul className="mt-2">
				<span className="pl-2 text-xs font-medium text-muted-foreground">
					Administrative
				</span>
				<AdminSidePanelItem
					href="/admin/sync"
					label="Synchronization"
					icon={<CloudSyncOutlineRounded className="size-6" />}
				/>
			</ul>

			<div className="flex-1" />
			<span className="text-xs text-muted-foreground">
				Build: {BUILD_DATE.getFullYear()}.{BUILD_DATE.getMonth()}.{BUILD_DATE.getDay()}
			</span>
		</div>
	);
}
