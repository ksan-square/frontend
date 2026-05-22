import Breadcrumbs from "@/app/_components/breadcrumbs";
import LiveForm from "../../live-form";
import SetlistEditor from "../../setlist-editor";
import Link from "next/link";
import { getAdminLiveDetail } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

type SetlistItem = {
    id: string;
    order_no: number;
    note: string | null;
    songs: {
        id: string;
        title: string;
    } | null;
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
    const live = {
        ...payload.live,
        venue_id: payload.live.venue?.id ?? "",
        benefit_venue_id: payload.live.benefit_venue?.id ?? "",
    };
    const venues = payload.venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
    }));
    const songs = payload.songs.map((song) => ({
        id: song.id,
        title: song.title,
    }));
    const setlistItems = payload.setlist_items.map((item) => ({
        id: item.id,
        order_no: item.order_no,
        note: item.note,
        songs: item.song
            ? {
                  id: "",
                  title: item.song.title,
              }
            : null,
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
                venues={venues ?? []}
                initialData={live}
            />

            <SetlistEditor
                liveId={id}
                songs={songs}
                initialItems={setlistItems as SetlistItem[]}
            />
        </main>
    );
}
