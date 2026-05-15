import { supabase } from "@/lib/supabase";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import SongPartForm from "./song-part-form";

export default async function NewSongPartPage() {
    const { data: songs } = await supabase
        .from("songs")
        .select("id,title")
        .eq("is_delete", false)
        .order("order_no", { ascending: true });

    const { data: members } = await supabase
        .from("members")
        .select("id,name")
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("sort_order");

    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "歌割・コール追加" },
                ]}
            />

            <h1 className="text-3xl font-bold">歌割・コールを追加</h1>
            <SongPartForm songs={songs ?? []} members={members ?? []} />
        </main>
    );
}
