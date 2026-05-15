import { supabase } from "@/lib/supabase";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import SongEditForm from "./song-edit-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: Props) {
    const { id } = await params;

    const { data: song, error } = await supabase
        .from("songs")
        .select("id,title,slug,order_no,description,release_date,lyricist,composer,arranger")
        .eq("id", id)
        .eq("is_delete", false)
        .single();

    if (error || !song) {
        return <main>曲が見つからなかった。</main>;
    }

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
        </main>
    );
}
