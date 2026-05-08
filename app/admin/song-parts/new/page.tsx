import { supabase } from "@/lib/supabase";
import SongPartForm from "./song-part-form";

export default async function NewSongPartPage() {
    const { data: songs } = await supabase
        .from("songs")
        .select("id,title")
        .order("title");

    const { data: members } = await supabase
        .from("members")
        .select("id,name")
        .eq("is_active", true)
        .order("sort_order");

    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">歌割・コールを追加</h1>
            <SongPartForm songs={songs ?? []} members={members ?? []} />
        </main>
    );
}