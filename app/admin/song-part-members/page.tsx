import { supabase } from "@/lib/supabase";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import SongPartMemberManager from "./song-part-member-manager";

export default async function SongPartMembersPage() {
    const { data: songs } = await supabase
        .from("songs")
        .select("id,title")
        .eq("is_delete", false)
        .order("order_no", { ascending: true });

    const { data: parts } = await supabase
        .from("song_parts")
        .select(`
      id,
      song_id,
      order_no,
      section_name,
      lyric_text,
      vocal_type,
      songs (
        title
      ),
      song_part_members (
        is_delete,
        member_id
      )
    `)
        .eq("vocal_type", "members")
        .eq("is_delete", false)
        .order("order_no");

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
                    { label: "歌唱メンバー管理" },
                ]}
            />

            <h1 className="text-3xl font-bold">歌唱メンバー管理</h1>
            <SongPartMemberManager
                songs={songs ?? []}
                parts={parts ?? []}
                members={members ?? []}
            />
        </main>
    );
}
