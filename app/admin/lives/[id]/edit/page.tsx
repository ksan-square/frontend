import Breadcrumbs from "@/app/_components/breadcrumbs";
import LiveForm from "../../live-form";
import ScheduleItemsEditor from "../../schedule-items-editor";
import Link from "next/link";
import { getAdminLiveDetail } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditPage({
    params,
}: Props) {
    const { id } = await params;
    let payload;
    let errorMessage: string | null = null;
    try {
        payload = await getAdminLiveDetail(id);
    } catch (error) {
        payload = null;
        errorMessage =
            error instanceof Error ? error.message : "unknown error";
    }

    if (errorMessage) {
        return <main>取得失敗: {errorMessage}</main>;
    }

    if (!payload?.found || !payload.live) {
        return <main>Not found</main>;
    }
    const live = payload.live;
    const venues = payload.venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        area: venue.area,
    }));
    const songs = payload.songs.map((song) => ({
        id: song.id,
        title: song.title,
    }));

    return (
        <main className="space-y-8">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/lives", label: "ライブ管理" },
                    { label: live.event_name },
                ]}
            />

            <Link href="/admin/lives" className="inline-block rounded-full bg-zinc-800 px-4 py-2">
                戻る
            </Link>
            <h1 className="text-3xl font-bold">
                ライブ編集
            </h1>

            <LiveForm
                initialData={live}
                venues={venues}
            />

            <ScheduleItemsEditor
                liveId={id}
                venues={venues}
                songs={songs}
                initialItems={live.schedule_items}
            />
        </main>
    );
}
