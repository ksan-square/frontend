import { supabase } from "@/lib/supabase";
import SongEditForm from "./song-edit-form";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: Props) {
    const { id } = await params;

    const { data: song, error } = await supabase
        .from("songs")
        .select("id,title,slug,description,release_date,lyricist,composer,arranger")
        .eq("id", id)
        .single();

    if (error || !song) {
        return <main>曲が見つからなかった。</main>;
    }

    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">曲を編集する。</h1>
            <SongEditForm song={song} />
        </main>
    );
}