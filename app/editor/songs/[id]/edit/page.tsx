import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import SongEditForm from "./song-edit-form";
import SongMarkdownEditor from "./song-markdown-editor";
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
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/songs", label: "曲管理" },
                    { label: song.title },
                ]}
            />

            <PageHero
                badge="Editor / Songs"
                title={song.title}
                description="曲情報・歌詞・コールブロックを編集します。"
            />

            <SongEditForm song={song} />
            <SongMarkdownEditor
                songId={song.id}
                songTitle={song.title}
                members={members}
                initialMarkdown={markdownPage?.body_markdown ?? ""}
                initialBlocks={payload.content_blocks}
            />
        </main>
    );
}
