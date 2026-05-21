import Breadcrumbs from "@/app/_components/breadcrumbs";
import SongEditForm from "./song-edit-form";
import SongMarkdownEditor from "./song-markdown-editor";
import Link from "next/link";
import { getAdminSongDetail } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: Props) {
    const { id } = await params;
    let payload;
    try {
        payload = await getAdminSongDetail(id);
    } catch {
        payload = null;
    }

    if (!payload?.found || !payload.song) {
        return <main>曲が見つからなかった。</main>;
    }
    const song = payload.song;
    const members = payload.members;
    const markdownPage = payload.markdown_page;

    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/songs", label: "曲管理" },
                    { label: song.title },
                ]}
            />

            <Link href="/admin/songs" className="inline-block rounded-full bg-zinc-800 px-4 py-2">
                戻る
            </Link>
            <h1 className="text-3xl font-bold">曲を編集する。</h1>
            <SongEditForm song={song} />
            <SongMarkdownEditor
                songId={song.id}
                songTitle={song.title}
                members={members}
                initialMarkdown={markdownPage?.body_markdown ?? ""}
            />
        </main>
    );
}
